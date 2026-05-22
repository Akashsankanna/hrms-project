"use strict";

// src/controllers/leave.controller.js
// HRMS — Leave Management (with email notifications)

const prisma = require("../config/db");
const {
  sendLeaveAppliedToManager,
  sendLeaveAppliedConfirmation,
  sendLeaveApproved,
  sendLeaveRejected,
  sendLeaveCancelled,
} = require("../services/leaveEmail.service");

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION A — SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

async function getEmployeeFromReq(req) {
  const keycloakId = req.user?.sub;
  if (!keycloakId) return null;
  return prisma.employee.findFirst({
    where:  { user: { keycloakId }, deletedAt: null },
    select: {
      id: true, employeeCode: true, firstName: true, lastName: true,
      workEmail: true, departmentId: true, reportingManagerId: true,
      dateOfJoining: true,
      department:  { select: { name: true } },
      reportingManager: {
        select: { id: true, firstName: true, lastName: true, workEmail: true },
      },
    },
  });
}

function toNum(val, fallback = 0) {
  if (val == null) return fallback;
  const n = parseFloat(val.toString());
  return isFinite(n) ? n : fallback;
}

function closingBalance(b) {
  return toNum(b.openingBalance) + toNum(b.accrued) + toNum(b.carryForwarded)
       - toNum(b.used) - toNum(b.encashed) - toNum(b.lapsed);
}

async function countWorkingDays(fromDate, toDate) {
  const from   = new Date(fromDate);
  const to     = new Date(toDate);
  let days     = 0;
  const cursor = new Date(from);
  const holidays = await prisma.holiday.findMany({
    where:  { isActive: true, date: { gte: from, lte: to } },
    select: { date: true },
  });
  const holidaySet = new Set(holidays.map(h => h.date.toISOString().split("T")[0]));
  while (cursor <= to) {
    const dow     = cursor.getDay();
    const dateStr = cursor.toISOString().split("T")[0];
    if (dow !== 0 && !holidaySet.has(dateStr)) days++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

async function hasOverlappingLeave(employeeId, fromDate, toDate, excludeRequestId = null) {
  const where = {
    employeeId,
    status:   { in: ["PENDING", "APPROVED"] },
    fromDate: { lte: new Date(toDate) },
    toDate:   { gte: new Date(fromDate) },
  };
  if (excludeRequestId) where.id = { not: excludeRequestId };
  const count = await prisma.leaveRequest.count({ where });
  return count > 0;
}

async function getOrCreateBalance(employeeId, leaveTypeId, year) {
  let balance = await prisma.employeeLeaveBalance.findUnique({
    where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
  });
  if (!balance) {
    const leaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
    balance = await prisma.employeeLeaveBalance.create({
      data: {
        employeeId, leaveTypeId, year,
        openingBalance: toNum(leaveType?.maxDaysPerYear, 0),
        accrued: 0, carryForwarded: 0, used: 0, encashed: 0, lapsed: 0,
      },
    });
  }
  return balance;
}

// Fetch HR admin email (first active admin user)
async function getHREmail() {
  try {
    const admin = await prisma.user.findFirst({
      where: { isActive: true, deletedAt: null, role: { name: "admin" } },
      select: { email: true },
    });
    return admin?.email || process.env.HR_EMAIL || null;
  } catch {
    return process.env.HR_EMAIL || null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION B — LEAVE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

async function getLeaveTypes(req, res) {
  try {
    const { includeInactive } = req.query;
    const leaveTypes = await prisma.leaveType.findMany({
      where:   includeInactive === "true" ? {} : { isActive: true },
      orderBy: { code: "asc" },
    });
    return res.json({ success: true, leaveTypes });
  } catch (err) {
    console.error("[getLeaveTypes]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function createLeaveType(req, res) {
  try {
    const {
      code, name, maxDaysPerYear, carryForwardDays = 0,
      encashable = false, requiresDoc = false,
      applicableGender = "ALL", minServiceDays = 0,
    } = req.body;

    if (!code || !name || maxDaysPerYear == null)
      return res.status(400).json({ error: "code, name and maxDaysPerYear are required" });

    const VALID_GENDER = ["ALL", "MALE", "FEMALE", "OTHER"];
    if (!VALID_GENDER.includes(applicableGender))
      return res.status(400).json({ error: "applicableGender must be ALL | MALE | FEMALE | OTHER" });

    const existing = await prisma.leaveType.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return res.status(409).json({ error: `Leave type ${code} already exists` });

    const leaveType = await prisma.leaveType.create({
      data: {
        code: code.toUpperCase(), name,
        maxDaysPerYear: parseFloat(maxDaysPerYear),
        carryForwardDays: parseFloat(carryForwardDays),
        encashable, requiresDoc, applicableGender,
        minServiceDays: parseInt(minServiceDays),
      },
    });
    return res.status(201).json({ success: true, leaveType });
  } catch (err) {
    console.error("[createLeaveType]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function updateLeaveType(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.leaveType.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: "Leave type not found" });

    const { name, maxDaysPerYear, carryForwardDays, encashable,
            requiresDoc, applicableGender, minServiceDays, isActive } = req.body;

    const updated = await prisma.leaveType.update({
      where: { id: parseInt(id) },
      data: {
        ...(name             !== undefined ? { name }                                       : {}),
        ...(maxDaysPerYear   !== undefined ? { maxDaysPerYear:   parseFloat(maxDaysPerYear)  } : {}),
        ...(carryForwardDays !== undefined ? { carryForwardDays: parseFloat(carryForwardDays) } : {}),
        ...(encashable       !== undefined ? { encashable }                                  : {}),
        ...(requiresDoc      !== undefined ? { requiresDoc }                                 : {}),
        ...(applicableGender !== undefined ? { applicableGender }                           : {}),
        ...(minServiceDays   !== undefined ? { minServiceDays: parseInt(minServiceDays) }   : {}),
        ...(isActive         !== undefined ? { isActive }                                   : {}),
      },
    });
    return res.json({ success: true, leaveType: updated });
  } catch (err) {
    console.error("[updateLeaveType]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION C — BALANCES
// ═══════════════════════════════════════════════════════════════════════════════

async function getMyBalances(req, res) {
  try {
    const employee = await getEmployeeFromReq(req);
    if (!employee) return res.status(401).json({ error: "Authentication required" });

    const year = parseInt(req.query.year || new Date().getFullYear());
    const leaveTypes = await prisma.leaveType.findMany({ where: { isActive: true } });
    const balances   = await Promise.all(leaveTypes.map(lt => getOrCreateBalance(employee.id, lt.id, year)));
    const leaveTypeMap = new Map(leaveTypes.map(lt => [lt.id, lt]));

    const result = balances.map(b => ({
      id: b.id, leaveType: leaveTypeMap.get(b.leaveTypeId), year: b.year,
      openingBalance: toNum(b.openingBalance), accrued: toNum(b.accrued),
      carryForwarded: toNum(b.carryForwarded), used: toNum(b.used),
      encashed: toNum(b.encashed), lapsed: toNum(b.lapsed),
      closingBalance: closingBalance(b),
    }));

    return res.json({ success: true, year, balances: result });
  } catch (err) {
    console.error("[getMyBalances]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getEmployeeBalances(req, res) {
  try {
    const { employeeCode } = req.params;
    const year = parseInt(req.query.year || new Date().getFullYear());
    const employee = await prisma.employee.findFirst({ where: { employeeCode, deletedAt: null } });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const leaveTypes = await prisma.leaveType.findMany({ where: { isActive: true } });
    const balances   = await Promise.all(leaveTypes.map(lt => getOrCreateBalance(employee.id, lt.id, year)));
    const leaveTypeMap = new Map(leaveTypes.map(lt => [lt.id, lt]));

    const result = balances.map(b => ({
      id: b.id, leaveType: leaveTypeMap.get(b.leaveTypeId), year: b.year,
      openingBalance: toNum(b.openingBalance), accrued: toNum(b.accrued),
      carryForwarded: toNum(b.carryForwarded), used: toNum(b.used),
      encashed: toNum(b.encashed), lapsed: toNum(b.lapsed),
      closingBalance: closingBalance(b),
    }));

    return res.json({
      success: true, year,
      employee: { id: employee.id, employeeCode, firstName: employee.firstName, lastName: employee.lastName },
      balances: result,
    });
  } catch (err) {
    console.error("[getEmployeeBalances]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function adjustBalance(req, res) {
  try {
    const { employeeCode, leaveTypeId, year, field, value } = req.body;
    const ALLOWED_FIELDS = ["openingBalance", "accrued", "carryForwarded", "encashed", "lapsed"];
    if (!ALLOWED_FIELDS.includes(field))
      return res.status(400).json({ error: `field must be one of: ${ALLOWED_FIELDS.join(", ")}` });

    const employee = await prisma.employee.findFirst({ where: { employeeCode, deletedAt: null } });
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const balance = await getOrCreateBalance(employee.id, parseInt(leaveTypeId), parseInt(year));
    const updated = await prisma.employeeLeaveBalance.update({
      where: { id: balance.id },
      data:  { [field]: parseFloat(value) },
    });
    return res.json({ success: true, balance: { ...updated, closingBalance: closingBalance(updated) } });
  } catch (err) {
    console.error("[adjustBalance]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function initializeYearBalances(req, res) {
  try {
    const { year } = req.body;
    if (!year) return res.status(400).json({ error: "year is required" });

    const [employees, leaveTypes] = await Promise.all([
      prisma.employee.findMany({ where: { deletedAt: null, isActive: true }, select: { id: true } }),
      prisma.leaveType.findMany({ where: { isActive: true } }),
    ]);

    let created = 0, skipped = 0;
    const prevYear = parseInt(year) - 1;

    for (const emp of employees) {
      for (const lt of leaveTypes) {
        const existingThisYear = await prisma.employeeLeaveBalance.findUnique({
          where: { employeeId_leaveTypeId_year: { employeeId: emp.id, leaveTypeId: lt.id, year: parseInt(year) } },
        });
        if (existingThisYear) { skipped++; continue; }

        let carryForwarded = 0;
        const prevBalance = await prisma.employeeLeaveBalance.findUnique({
          where: { employeeId_leaveTypeId_year: { employeeId: emp.id, leaveTypeId: lt.id, year: prevYear } },
        });
        if (prevBalance && toNum(lt.carryForwardDays) > 0) {
          const prevClosing = closingBalance(prevBalance);
          carryForwarded = Math.max(0, Math.min(prevClosing, toNum(lt.carryForwardDays)));
        }

        await prisma.employeeLeaveBalance.create({
          data: {
            employeeId: emp.id, leaveTypeId: lt.id, year: parseInt(year),
            openingBalance: toNum(lt.maxDaysPerYear),
            accrued: 0, carryForwarded, used: 0, encashed: 0, lapsed: 0,
          },
        });
        created++;
      }
    }

    return res.json({ success: true, message: `Initialized ${year} balances`, created, skipped });
  } catch (err) {
    console.error("[initializeYearBalances]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION D — LEAVE REQUESTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/leave/requests
// ─────────────────────────────────────────────────────────────────────────────
async function applyLeave(req, res) {
  try {
    const employee = await getEmployeeFromReq(req);
    if (!employee) return res.status(401).json({ error: "Authentication required" });

    const { leaveTypeId, fromDate, toDate, reason, halfDayIndicator = "NONE", medicalDocUrl } = req.body;

    if (!leaveTypeId || !fromDate || !toDate)
      return res.status(400).json({ error: "leaveTypeId, fromDate and toDate are required" });

    const from = new Date(fromDate);
    const to   = new Date(toDate);
    if (isNaN(from) || isNaN(to))
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
    if (to < from)
      return res.status(400).json({ error: "toDate must be on or after fromDate" });

    const VALID_HALF = ["NONE", "FIRST", "SECOND"];
    if (!VALID_HALF.includes(halfDayIndicator))
      return res.status(400).json({ error: "halfDayIndicator must be NONE | FIRST | SECOND" });

    const leaveType = await prisma.leaveType.findUnique({ where: { id: parseInt(leaveTypeId) } });
    if (!leaveType || !leaveType.isActive)
      return res.status(404).json({ error: "Leave type not found or inactive" });

    // Gender check
    if (leaveType.applicableGender !== "ALL") {
      const empDetail = await prisma.employeePersonalDetail.findUnique({
        where:   { employeeId: employee.id },
        include: { employee: { include: { gender: true } } },
      });
      const empGender = empDetail?.employee?.gender?.code;
      if (empGender && empGender !== leaveType.applicableGender)
        return res.status(400).json({ error: `${leaveType.name} is not applicable for your gender` });
    }

    // Min service days
    if (leaveType.minServiceDays > 0 && employee.dateOfJoining) {
      const daysSince = Math.floor((Date.now() - new Date(employee.dateOfJoining)) / 86400000);
      if (daysSince < leaveType.minServiceDays)
        return res.status(400).json({
          error: `You need at least ${leaveType.minServiceDays} days of service for ${leaveType.name}`,
        });
    }

    // Doc required
    if (leaveType.requiresDoc && !medicalDocUrl)
      return res.status(400).json({ error: `Medical document URL is required for ${leaveType.name}` });

    // Duration
    let durationDays = halfDayIndicator !== "NONE"
      ? 0.5
      : await countWorkingDays(fromDate, toDate);

    if (durationDays === 0)
      return res.status(400).json({ error: "No working days in the selected date range" });

    // Overlap
    if (await hasOverlappingLeave(employee.id, fromDate, toDate))
      return res.status(409).json({ error: "You already have a leave in this date range" });

    // Balance
    const year    = from.getFullYear();
    const balance = await getOrCreateBalance(employee.id, parseInt(leaveTypeId), year);
    const closing = closingBalance(balance);

    if (leaveType.code !== "LWP" && leaveType.code !== "WFH") {
      if (closing < durationDays)
        return res.status(400).json({
          error: `Insufficient balance. Available: ${closing.toFixed(1)}d, Requested: ${durationDays}d`,
          available: closing,
          requested: durationDays,
        });
    }

    // ── Create request ────────────────────────────────────────────────────────
    const request = await prisma.$transaction(async (tx) => {
      const newRequest = await tx.leaveRequest.create({
        data: {
          employeeId:      employee.id,
          leaveTypeId:     parseInt(leaveTypeId),
          fromDate:        from,
          toDate:          to,
          durationDays,
          halfDayIndicator,
          reason:          reason        || null,
          medicalDocUrl:   medicalDocUrl || null,
          status:          "PENDING",
        },
      });

      if (employee.reportingManagerId) {
        await tx.leaveApproval.create({
          data: {
            requestId:  newRequest.id,
            approverId: employee.reportingManagerId,
            level:      1,
            action:     "PENDING",
          },
        });
      }
      return newRequest;
    });

    const fullRequest = await prisma.leaveRequest.findUnique({
      where:   { id: request.id },
      include: {
        leaveType: true,
        approvals: {
          include: { approver: { select: { id: true, firstName: true, lastName: true, employeeCode: true } } },
        },
      },
    });

    // ── Send emails (non-blocking) ────────────────────────────────────────────
    const hrEmail      = await getHREmail();
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    const managerName  = employee.reportingManager
      ? `${employee.reportingManager.firstName} ${employee.reportingManager.lastName}`
      : null;

    // Email 1: confirmation to employee
    sendLeaveAppliedConfirmation({
      employeeEmail:    employee.workEmail,
      employeeName,
      leaveType:        leaveType.name,
      fromDate:         from,
      toDate:           to,
      durationDays,
      halfDayIndicator,
      reason,
      managerName,
      availableBalance: parseFloat((closing - durationDays).toFixed(1)),
    }).catch(e => console.error("[email] confirmation:", e.message));

    // Email 2: to manager + HR
    sendLeaveAppliedToManager({
      managerEmail:     employee.reportingManager?.workEmail || hrEmail,
      managerName,
      hrEmail,
      employeeName,
      employeeCode:     employee.employeeCode,
      department:       employee.department?.name,
      leaveType:        leaveType.name,
      fromDate:         from,
      toDate:           to,
      durationDays,
      halfDayIndicator,
      reason,
      requestId:        request.id,
      availableBalance: parseFloat(closing.toFixed(1)),
    }).catch(e => console.error("[email] manager notify:", e.message));

    return res.status(201).json({
      success: true,
      request: fullRequest,
      durationDays,
      balanceAfterApproval: parseFloat((closing - durationDays).toFixed(1)),
    });
  } catch (err) {
    console.error("[applyLeave]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getMyRequests(req, res) {
  try {
    const employee = await getEmployeeFromReq(req);
    if (!employee) return res.status(401).json({ error: "Authentication required" });

    const { status, year = new Date().getFullYear(), page = 1, limit = 20 } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      employeeId: employee.id,
      fromDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) },
      ...(status ? { status } : {}),
    };

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where, skip, take: parseInt(limit), orderBy: { appliedAt: "desc" },
        include: {
          leaveType: true,
          approvals: {
            orderBy: { level: "asc" },
            include: { approver: { select: { id: true, firstName: true, lastName: true, employeeCode: true } } },
          },
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return res.json({ success: true, requests, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error("[getMyRequests]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getPendingApprovals(req, res) {
  try {
    const employee = await getEmployeeFromReq(req);
    if (!employee) return res.status(401).json({ error: "Authentication required" });

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const approvalRows = await prisma.leaveApproval.findMany({
      where: { approverId: employee.id, action: "PENDING" },
      select: { requestId: true },
    });
    const requestIds = [...new Set(approvalRows.map(a => a.requestId))];

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where: { id: { in: requestIds }, status: "PENDING" },
        skip, take: parseInt(limit), orderBy: { appliedAt: "asc" },
        include: {
          leaveType: true,
          employee: {
            select: {
              id: true, employeeCode: true, firstName: true, lastName: true,
              department: { select: { name: true } }, designation: { select: { name: true } },
            },
          },
          approvals: {
            orderBy: { level: "asc" },
            include: { approver: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
      }),
      prisma.leaveRequest.count({ where: { id: { in: requestIds }, status: "PENDING" } }),
    ]);

    return res.json({ success: true, requests, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error("[getPendingApprovals]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllRequests(req, res) {
  try {
    const { employeeCode, status, leaveTypeId, from, to, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let employeeId;
    if (employeeCode) {
      const emp = await prisma.employee.findFirst({ where: { employeeCode, deletedAt: null } });
      if (!emp) return res.status(404).json({ error: "Employee not found" });
      employeeId = emp.id;
    }

    const where = {
      ...(employeeId  ? { employeeId }                          : {}),
      ...(status      ? { status }                              : {}),
      ...(leaveTypeId ? { leaveTypeId: parseInt(leaveTypeId) } : {}),
      ...(from && to  ? { fromDate: { gte: new Date(from) }, toDate: { lte: new Date(to) } } : {}),
    };

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where, skip, take: parseInt(limit), orderBy: { appliedAt: "desc" },
        include: {
          leaveType: true,
          employee: {
            select: {
              id: true, employeeCode: true, firstName: true, lastName: true,
              department:  { select: { name: true } }, designation: { select: { name: true } },
            },
          },
          approvals: {
            orderBy: { level: "asc" },
            include: { approver: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return res.json({ success: true, requests, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error("[getAllRequests]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getRequestById(req, res) {
  try {
    const request = await prisma.leaveRequest.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true, employeeCode: true, firstName: true, lastName: true, workEmail: true,
            department: { select: { name: true } }, designation: { select: { name: true } },
          },
        },
        approvals: {
          orderBy: { level: "asc" },
          include: { approver: { select: { id: true, firstName: true, lastName: true, employeeCode: true } } },
        },
      },
    });
    if (!request) return res.status(404).json({ error: "Leave request not found" });
    return res.json({ success: true, request });
  } catch (err) {
    console.error("[getRequestById]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/leave/requests/:id/cancel  — with cancellation email
// ─────────────────────────────────────────────────────────────────────────────
async function cancelRequest(req, res) {
  try {
    const employee = await getEmployeeFromReq(req);
    if (!employee) return res.status(401).json({ error: "Authentication required" });

    const { cancelReason } = req.body;
    const request = await prisma.leaveRequest.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true, firstName: true, lastName: true, workEmail: true, employeeCode: true,
            reportingManager: { select: { firstName: true, lastName: true, workEmail: true } },
          },
        },
      },
    });

    if (!request) return res.status(404).json({ error: "Leave request not found" });
    if (request.employeeId !== employee.id)
      return res.status(403).json({ error: "You can only cancel your own leave requests" });
    if (!["PENDING", "APPROVED"].includes(request.status))
      return res.status(400).json({ error: `Cannot cancel a ${request.status} request` });

    const wasApproved = request.status === "APPROVED";

    await prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id: parseInt(req.params.id) },
        data:  {
          status:       wasApproved ? "CANCELLED" : "WITHDRAWN",
          cancelledAt:  new Date(),
          cancelReason: cancelReason || null,
        },
      });

      if (wasApproved) {
        const year = new Date(request.fromDate).getFullYear();
        await tx.employeeLeaveBalance.updateMany({
          where: { employeeId: employee.id, leaveTypeId: request.leaveTypeId, year },
          data:  { used: { decrement: toNum(request.durationDays) } },
        });
      }
    });

    // ── Send cancellation email ───────────────────────────────────────────────
    const hrEmail    = await getHREmail();
    const empName    = `${request.employee.firstName} ${request.employee.lastName}`;
    const mgr        = request.employee.reportingManager;

    sendLeaveCancelled({
      managerEmail: mgr?.workEmail || hrEmail,
      managerName:  mgr ? `${mgr.firstName} ${mgr.lastName}` : null,
      hrEmail,
      employeeName: empName,
      employeeCode: request.employee.employeeCode,
      leaveType:    request.leaveType.name,
      fromDate:     request.fromDate,
      toDate:       request.toDate,
      durationDays: toNum(request.durationDays),
      cancelReason,
      wasApproved,
    }).catch(e => console.error("[email] cancel:", e.message));

    return res.json({ success: true, message: `Leave request ${wasApproved ? "cancelled" : "withdrawn"}` });
  } catch (err) {
    console.error("[cancelRequest]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION E — APPROVALS (with email notifications)
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/leave/requests/:id/approve
// ─────────────────────────────────────────────────────────────────────────────
async function actionLeaveRequest(req, res) {
  try {
    const approver = await getEmployeeFromReq(req);
    if (!approver) return res.status(401).json({ error: "Authentication required" });

    const { action, comments } = req.body;
    const VALID_ACTIONS = ["APPROVED", "REJECTED"];
    if (!VALID_ACTIONS.includes(action))
      return res.status(400).json({ error: "action must be APPROVED or REJECTED" });

    const request = await prisma.leaveRequest.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: {
        leaveType: true,
        approvals: { orderBy: { level: "asc" } },
        employee: {
          select: {
            id: true, firstName: true, lastName: true, workEmail: true,
            employeeCode: true,
          },
        },
      },
    });

    if (!request) return res.status(404).json({ error: "Leave request not found" });
    if (request.status !== "PENDING")
      return res.status(400).json({ error: `Request is already ${request.status}` });

    const myApproval = request.approvals.find(
      a => a.approverId === approver.id && a.action === "PENDING"
    );

    if (!myApproval) {
      const isAdmin = req.user?.realm_access?.roles?.includes("admin");
      if (!isAdmin)
        return res.status(403).json({ error: "You are not assigned to approve this request" });
    }

    await prisma.$transaction(async (tx) => {
      // Update approval row
      if (myApproval) {
        await tx.leaveApproval.update({
          where: { id: myApproval.id },
          data:  { action, comments: comments || null, actionedAt: new Date() },
        });
      } else {
        await tx.leaveApproval.create({
          data: {
            requestId:  request.id,
            approverId: approver.id,
            level:      99,
            action,
            comments:   comments || null,
            actionedAt: new Date(),
          },
        });
      }

      if (action === "APPROVED") {
        await tx.leaveRequest.update({ where: { id: request.id }, data: { status: "APPROVED" } });

        // Deduct balance
        const year = new Date(request.fromDate).getFullYear();
        await tx.employeeLeaveBalance.updateMany({
          where: { employeeId: request.employeeId, leaveTypeId: request.leaveTypeId, year },
          data:  { used: { increment: toNum(request.durationDays) } },
        });

        // Mark attendance as ON_LEAVE
        const from   = new Date(request.fromDate);
        const to     = new Date(request.toDate);
        const cursor = new Date(from);
        while (cursor <= to) {
          if (cursor.getDay() !== 0) {
            await tx.attendanceSummary.upsert({
              where:  { employeeId_attendanceDate: { employeeId: request.employeeId, attendanceDate: new Date(cursor) } },
              update: { status: "ON_LEAVE" },
              create: { employeeId: request.employeeId, attendanceDate: new Date(cursor), status: "ON_LEAVE", totalHours: 0 },
            });
          }
          cursor.setDate(cursor.getDate() + 1);
        }
      } else {
        await tx.leaveRequest.update({ where: { id: request.id }, data: { status: "REJECTED" } });
      }
    });

    // ── Send email to employee ────────────────────────────────────────────────
    const approverName = `${approver.firstName} ${approver.lastName}`;
    const empName      = `${request.employee.firstName} ${request.employee.lastName}`;

    if (action === "APPROVED") {
      // Get remaining balance after deduction
      const year    = new Date(request.fromDate).getFullYear();
      const balance = await getOrCreateBalance(request.employee.id, request.leaveTypeId, year);
      const remaining = closingBalance(balance);

      sendLeaveApproved({
        employeeEmail:    request.employee.workEmail,
        employeeName:     empName,
        leaveType:        request.leaveType.name,
        fromDate:         request.fromDate,
        toDate:           request.toDate,
        durationDays:     toNum(request.durationDays),
        halfDayIndicator: request.halfDayIndicator,
        approverName,
        approverComments: comments || null,
        remainingBalance: parseFloat(remaining.toFixed(1)),
      }).catch(e => console.error("[email] approved:", e.message));

    } else {
      sendLeaveRejected({
        employeeEmail:    request.employee.workEmail,
        employeeName:     empName,
        leaveType:        request.leaveType.name,
        fromDate:         request.fromDate,
        toDate:           request.toDate,
        durationDays:     toNum(request.durationDays),
        halfDayIndicator: request.halfDayIndicator,
        approverName,
        approverComments: comments || null,
      }).catch(e => console.error("[email] rejected:", e.message));
    }

    const updated = await prisma.leaveRequest.findUnique({
      where:   { id: request.id },
      include: {
        leaveType: true,
        employee:  { select: { id: true, firstName: true, lastName: true, workEmail: true } },
        approvals: { include: { approver: { select: { firstName: true, lastName: true } } } },
      },
    });

    return res.json({ success: true, request: updated });
  } catch (err) {
    console.error("[actionLeaveRequest]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function escalateRequest(req, res) {
  try {
    const { nextApproverId } = req.body;
    if (!nextApproverId) return res.status(400).json({ error: "nextApproverId is required" });

    const request = await prisma.leaveRequest.findUnique({
      where:   { id: parseInt(req.params.id) },
      include: { approvals: { orderBy: { level: "desc" }, take: 1 } },
    });
    if (!request) return res.status(404).json({ error: "Leave request not found" });
    if (request.status !== "PENDING")
      return res.status(400).json({ error: `Request is already ${request.status}` });

    const currentLevel = request.approvals[0]?.level || 0;
    if (request.approvals[0]) {
      await prisma.leaveApproval.update({
        where: { id: request.approvals[0].id },
        data:  { action: "ESCALATED", actionedAt: new Date() },
      });
    }
    const newApproval = await prisma.leaveApproval.create({
      data: { requestId: request.id, approverId: parseInt(nextApproverId), level: currentLevel + 1, action: "PENDING" },
    });

    return res.json({ success: true, approval: newApproval });
  } catch (err) {
    console.error("[escalateRequest]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION F — REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

async function getDashboardSummary(req, res) {
  try {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [pending, approved, rejected, onLeaveToday] = await Promise.all([
      prisma.leaveRequest.count({ where: { status: "PENDING" } }),
      prisma.leaveRequest.count({ where: { status: "APPROVED", fromDate: { gte: monthStart }, toDate: { lte: monthEnd } } }),
      prisma.leaveRequest.count({ where: { status: "REJECTED", fromDate: { gte: monthStart } } }),
      prisma.leaveRequest.count({ where: { status: "APPROVED", fromDate: { lte: now }, toDate: { gte: now } } }),
    ]);

    const typeBreakdown = await prisma.leaveRequest.groupBy({
      by: ["leaveTypeId"],
      where: { status: "APPROVED", fromDate: { gte: monthStart }, toDate: { lte: monthEnd } },
      _count: { id: true }, _sum: { durationDays: true },
    });

    const leaveTypeIds = typeBreakdown.map(t => t.leaveTypeId);
    const leaveTypes   = await prisma.leaveType.findMany({ where: { id: { in: leaveTypeIds } } });
    const ltMap        = new Map(leaveTypes.map(lt => [lt.id, lt]));

    const breakdown = typeBreakdown.map(t => ({
      leaveType: ltMap.get(t.leaveTypeId),
      count:     t._count.id,
      totalDays: toNum(t._sum.durationDays),
    }));

    const recentPending = await prisma.leaveRequest.findMany({
      where:   { status: "PENDING" },
      orderBy: { appliedAt: "asc" },
      take:    10,
      include: {
        leaveType: true,
        employee: { select: { id: true, firstName: true, lastName: true, employeeCode: true, department: { select: { name: true } } } },
      },
    });

    return res.json({ success: true, stats: { pending, approved, rejected, onLeaveToday }, breakdown, recentPending });
  } catch (err) {
    console.error("[getDashboardSummary]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getTeamLeaveCalendar(req, res) {
  try {
    const { from = new Date().toISOString().split("T")[0], to, departmentId } = req.query;
    const toDate = to || from;

    const requests = await prisma.leaveRequest.findMany({
      where: {
        status:   "APPROVED",
        fromDate: { lte: new Date(toDate) },
        toDate:   { gte: new Date(from) },
        ...(departmentId ? { employee: { departmentId: parseInt(departmentId) } } : {}),
      },
      include: {
        leaveType: { select: { code: true, name: true } },
        employee: {
          select: {
            id: true, firstName: true, lastName: true, employeeCode: true,
            department:  { select: { name: true } },
            designation: { select: { name: true } },
          },
        },
      },
      orderBy: { fromDate: "asc" },
    });

    return res.json({ success: true, requests, dateRange: { from, to: toDate } });
  } catch (err) {
    console.error("[getTeamLeaveCalendar]", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
module.exports = {
  getLeaveTypes, createLeaveType, updateLeaveType,
  getMyBalances, getEmployeeBalances, adjustBalance, initializeYearBalances,
  applyLeave, getMyRequests, getPendingApprovals, getAllRequests, getRequestById, cancelRequest,
  actionLeaveRequest, escalateRequest,
  getDashboardSummary, getTeamLeaveCalendar,
};