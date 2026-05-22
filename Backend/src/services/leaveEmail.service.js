"use strict";

// src/services/leaveEmail.service.js
// HRMS — Leave Management Email Notifications
// Covers: Applied → Manager, Approved → Employee, Rejected → Employee, Cancelled

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

// ─────────────────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function statusColor(status) {
  const map = {
    PENDING:   "#9c6f0c",
    APPROVED:  "#2d6e33",
    REJECTED:  "#8a3525",
    CANCELLED: "#666666",
    WITHDRAWN: "#666666",
  };
  return map[status] || "#333333";
}

function statusBg(status) {
  const map = {
    PENDING:   "#fef9ec",
    APPROVED:  "#f0faf0",
    REJECTED:  "#fef0ee",
    CANCELLED: "#f5f5f5",
    WITHDRAWN: "#f5f5f5",
  };
  return map[status] || "#f9f9f9";
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE EMAIL WRAPPER — shared header/footer for all leave emails
// ─────────────────────────────────────────────────────────────────────────────
function wrapEmail({ title, subtitle, bodyHtml }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#f4f4f0; font-family:Arial, sans-serif;">
  <div style="max-width:600px; margin:32px auto; background:#fff;
              border-radius:12px; overflow:hidden;
              box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:#1e3a1e; padding:28px 36px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:40px; height:40px; background:rgba(255,255,255,0.15);
                    border-radius:8px; display:flex; align-items:center; justify-content:center;
                    font-size:20px;">🌿</div>
        <div>
          <div style="color:#a8e6b0; font-size:11px; font-weight:700;
                      letter-spacing:2px; text-transform:uppercase;">
            Two Elephants Technologies LLP
          </div>
          <div style="color:#fff; font-size:18px; font-weight:700; margin-top:2px;">
            ${title}
          </div>
        </div>
      </div>
      ${subtitle ? `<p style="color:rgba(255,255,255,0.65); font-size:13px; margin:12px 0 0;">${subtitle}</p>` : ""}
    </div>

    <!-- Body -->
    <div style="padding:32px 36px;">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div style="background:#f8f9f8; border-top:1px solid #e8ece4;
                padding:20px 36px; text-align:center;">
      <p style="color:#999; font-size:11px; margin:0; line-height:1.6;">
        This is an automated notification from <strong>PeopleCore HRMS</strong>.<br>
        Please do not reply to this email. For queries, contact HR at
        <a href="mailto:${process.env.HR_EMAIL || process.env.SMTP_USER}"
           style="color:#2d6e33;">${process.env.HR_EMAIL || "hr@company.com"}</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEAVE DETAIL CARD — reused in multiple email types
// ─────────────────────────────────────────────────────────────────────────────
function leaveDetailCard({ employeeName, employeeCode, department,
                           leaveType, fromDate, toDate, durationDays,
                           halfDayIndicator, reason, status }) {
  const halfDayLabel = halfDayIndicator === "FIRST"  ? " (First Half)"
                     : halfDayIndicator === "SECOND" ? " (Second Half)"
                     : "";

  return `
<div style="background:#f8faf8; border:1px solid #e0e8e0; border-radius:10px;
            padding:22px 24px; margin:20px 0;">

  <!-- Leave type badge -->
  <div style="display:inline-block; background:${statusBg(status)};
              color:${statusColor(status)}; font-size:11px; font-weight:700;
              padding:4px 12px; border-radius:20px; margin-bottom:16px;
              text-transform:uppercase; letter-spacing:1px;">
    ${leaveType} · ${status}
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:13.5px; color:#444;">
    <tr>
      <td style="padding:8px 0; width:140px; color:#888; font-weight:600; vertical-align:top;">Employee</td>
      <td style="padding:8px 0; font-weight:600; color:#1a1a1a;">
        ${employeeName}
        ${employeeCode ? `<span style="color:#999; font-weight:400; font-size:12px;"> · ${employeeCode}</span>` : ""}
      </td>
    </tr>
    ${department ? `
    <tr>
      <td style="padding:8px 0; color:#888; font-weight:600;">Department</td>
      <td style="padding:8px 0;">${department}</td>
    </tr>` : ""}
    <tr>
      <td style="padding:8px 0; color:#888; font-weight:600;">Leave Type</td>
      <td style="padding:8px 0; font-weight:600;">${leaveType}</td>
    </tr>
    <tr>
      <td style="padding:8px 0; color:#888; font-weight:600;">From</td>
      <td style="padding:8px 0;">${formatDate(fromDate)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0; color:#888; font-weight:600;">To</td>
      <td style="padding:8px 0;">${formatDate(toDate)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0; color:#888; font-weight:600;">Duration</td>
      <td style="padding:8px 0; font-weight:700; color:#1a1a1a;">
        ${durationDays} working day${durationDays !== 1 ? "s" : ""}${halfDayLabel}
      </td>
    </tr>
    ${reason ? `
    <tr>
      <td style="padding:8px 0; color:#888; font-weight:600; vertical-align:top;">Reason</td>
      <td style="padding:8px 0; color:#555; font-style:italic;">"${reason}"</td>
    </tr>` : ""}
  </table>
</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFE SEND — never throws, always logs
// ─────────────────────────────────────────────────────────────────────────────
async function safeSend({ to, subject, html, tag }) {
  if (!to) {
    console.warn(`[LeaveEmail][${tag}] No recipient email — skipping`);
    return;
  }
  try {
    await transporter.sendMail({
      from:    `"PeopleCore HRMS" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[LeaveEmail][${tag}] ✓ Sent → ${to}`);
  } catch (err) {
    // Never crash the API — email failure is non-fatal
    console.error(`[LeaveEmail][${tag}] ✗ Failed → ${to}:`, err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL 1 — EMPLOYEE APPLIED → notify manager + HR
// Triggered: when employee submits a leave request
// ═══════════════════════════════════════════════════════════════════════════════
async function sendLeaveAppliedToManager({
  managerEmail,
  managerName,
  hrEmail,
  employeeName,
  employeeCode,
  department,
  leaveType,
  fromDate,
  toDate,
  durationDays,
  halfDayIndicator = "NONE",
  reason,
  requestId,
  availableBalance,
}) {
  const card = leaveDetailCard({
    employeeName, employeeCode, department,
    leaveType, fromDate, toDate, durationDays,
    halfDayIndicator, reason, status: "PENDING",
  });

  const approveLink = `${process.env.APP_URL || "http://localhost:8081"}/leave/requests/${requestId}`;

  const bodyHtml = `
    <p style="font-size:15px; color:#333; margin-top:0;">
      Hi <strong>${managerName || "Manager"}</strong>,
    </p>
    <p style="font-size:14px; color:#555; line-height:1.6; margin-bottom:4px;">
      <strong>${employeeName}</strong> has submitted a leave request that requires your approval.
    </p>

    ${card}

    <!-- Balance info -->
    ${availableBalance !== undefined ? `
    <div style="background:#fff8e1; border:1px solid #ffe082; border-radius:8px;
                padding:12px 18px; margin-bottom:20px; font-size:13px; color:#5d4037;">
      ℹ️ <strong>Remaining balance before approval:</strong>
      ${availableBalance} days of ${leaveType}
    </div>` : ""}

    <!-- Action button -->
    <div style="text-align:center; margin:28px 0;">
      <a href="${approveLink}"
         style="display:inline-block; padding:13px 32px;
                background:#1e3a1e; color:#fff;
                text-decoration:none; border-radius:8px;
                font-size:14px; font-weight:700; letter-spacing:0.5px;">
        Review &amp; Take Action →
      </a>
    </div>

    <p style="font-size:12.5px; color:#999; text-align:center;">
      Log in to HRMS to approve or reject this request.
    </p>`;

  const html = wrapEmail({
    title:    "Leave Request Pending Approval",
    subtitle: `${employeeName} has applied for ${leaveType}`,
    bodyHtml,
  });

  // Send to manager
  await safeSend({
    to:      managerEmail,
    subject: `🟡 Leave Request: ${employeeName} — ${leaveType} (${durationDays}d)`,
    html,
    tag:     "APPLIED→MANAGER",
  });

  // CC HR if hrEmail provided and different from manager
  if (hrEmail && hrEmail !== managerEmail) {
    await safeSend({
      to:      hrEmail,
      subject: `[CC] Leave Request: ${employeeName} — ${leaveType} (${durationDays}d)`,
      html,
      tag:     "APPLIED→HR",
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL 2 — EMPLOYEE CONFIRMATION — notify employee their request was received
// Triggered: immediately after successful applyLeave
// ═══════════════════════════════════════════════════════════════════════════════
async function sendLeaveAppliedConfirmation({
  employeeEmail,
  employeeName,
  leaveType,
  fromDate,
  toDate,
  durationDays,
  halfDayIndicator = "NONE",
  reason,
  managerName,
  availableBalance,
}) {
  const card = leaveDetailCard({
    employeeName, leaveType, fromDate, toDate,
    durationDays, halfDayIndicator, reason, status: "PENDING",
  });

  const bodyHtml = `
    <p style="font-size:15px; color:#333; margin-top:0;">
      Hi <strong>${employeeName}</strong>,
    </p>
    <p style="font-size:14px; color:#555; line-height:1.6;">
      Your leave request has been successfully submitted and is now
      <strong style="color:#9c6f0c;">pending approval</strong>
      ${managerName ? `from <strong>${managerName}</strong>` : "from your reporting manager"}.
    </p>

    ${card}

    ${availableBalance !== undefined ? `
    <div style="background:#f0faf0; border:1px solid #c8e6c9; border-radius:8px;
                padding:12px 18px; margin-bottom:20px; font-size:13px; color:#2d5a2d;">
      📊 <strong>Your remaining ${leaveType} balance:</strong> ${availableBalance} days
      <span style="color:#999; font-size:12px;">(after this request is approved)</span>
    </div>` : ""}

    <div style="background:#fff8e1; border-left:4px solid #ffc107;
                border-radius:0 8px 8px 0; padding:14px 18px; margin:20px 0;
                font-size:13px; color:#5d4037;">
      <strong>What happens next?</strong><br>
      Your manager will review and respond to your request. You will receive
      an email notification once a decision is made. You can also track the
      status in the HRMS portal under <em>Leave → My Requests</em>.
    </div>`;

  const html = wrapEmail({
    title:    "Leave Request Submitted",
    subtitle: "Your request is pending approval",
    bodyHtml,
  });

  await safeSend({
    to:      employeeEmail,
    subject: `✅ Leave Request Submitted — ${leaveType} (${durationDays}d)`,
    html,
    tag:     "APPLIED→EMPLOYEE",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL 3 — APPROVED → notify employee
// Triggered: when manager/admin approves the request
// ═══════════════════════════════════════════════════════════════════════════════
async function sendLeaveApproved({
  employeeEmail,
  employeeName,
  leaveType,
  fromDate,
  toDate,
  durationDays,
  halfDayIndicator = "NONE",
  approverName,
  approverComments,
  remainingBalance,
}) {
  const card = leaveDetailCard({
    employeeName, leaveType, fromDate, toDate,
    durationDays, halfDayIndicator, status: "APPROVED",
  });

  const bodyHtml = `
    <p style="font-size:15px; color:#333; margin-top:0;">
      Hi <strong>${employeeName}</strong>,
    </p>

    <!-- Status banner -->
    <div style="background:#f0faf0; border:1px solid #81c784;
                border-radius:10px; padding:18px 22px; margin-bottom:24px;
                text-align:center;">
      <div style="font-size:32px; margin-bottom:8px;">✅</div>
      <div style="font-size:18px; font-weight:700; color:#2d6e33;">
        Your Leave Has Been Approved
      </div>
      <div style="font-size:13px; color:#555; margin-top:6px;">
        Approved by <strong>${approverName || "your manager"}</strong>
      </div>
    </div>

    ${card}

    ${approverComments ? `
    <div style="background:#f8faf8; border-left:4px solid #2d6e33;
                border-radius:0 8px 8px 0; padding:14px 18px; margin:16px 0;
                font-size:13px; color:#444;">
      <strong style="color:#2d6e33;">Approver's Note:</strong><br>
      <span style="font-style:italic; color:#666;">"${approverComments}"</span>
    </div>` : ""}

    ${remainingBalance !== undefined ? `
    <div style="background:#f0faf0; border:1px solid #c8e6c9; border-radius:8px;
                padding:12px 18px; margin-bottom:20px; font-size:13px; color:#2d5a2d;">
      📊 <strong>Remaining ${leaveType} balance:</strong> ${remainingBalance} days
    </div>` : ""}

    <div style="background:#fff8e1; border-left:4px solid #ffc107;
                border-radius:0 8px 8px 0; padding:14px 18px; margin:20px 0;
                font-size:13px; color:#5d4037;">
      <strong>Reminder:</strong> Please ensure your work is handed over
      before your leave begins. Update your out-of-office message and
      inform your team about your absence.
    </div>`;

  const html = wrapEmail({
    title:    "Leave Approved ✅",
    subtitle: `${leaveType} approved for ${durationDays} day${durationDays !== 1 ? "s" : ""}`,
    bodyHtml,
  });

  await safeSend({
    to:      employeeEmail,
    subject: `✅ Leave Approved — ${leaveType} (${formatDate(fromDate)})`,
    html,
    tag:     "APPROVED→EMPLOYEE",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL 4 — REJECTED → notify employee
// Triggered: when manager/admin rejects the request
// ═══════════════════════════════════════════════════════════════════════════════
async function sendLeaveRejected({
  employeeEmail,
  employeeName,
  leaveType,
  fromDate,
  toDate,
  durationDays,
  halfDayIndicator = "NONE",
  approverName,
  approverComments,
}) {
  const card = leaveDetailCard({
    employeeName, leaveType, fromDate, toDate,
    durationDays, halfDayIndicator, status: "REJECTED",
  });

  const bodyHtml = `
    <p style="font-size:15px; color:#333; margin-top:0;">
      Hi <strong>${employeeName}</strong>,
    </p>

    <!-- Status banner -->
    <div style="background:#fef0ee; border:1px solid #ef9a9a;
                border-radius:10px; padding:18px 22px; margin-bottom:24px;
                text-align:center;">
      <div style="font-size:32px; margin-bottom:8px;">❌</div>
      <div style="font-size:18px; font-weight:700; color:#8a3525;">
        Your Leave Request Was Not Approved
      </div>
      <div style="font-size:13px; color:#555; margin-top:6px;">
        Reviewed by <strong>${approverName || "your manager"}</strong>
      </div>
    </div>

    ${card}

    ${approverComments ? `
    <div style="background:#fef0ee; border-left:4px solid #e57373;
                border-radius:0 8px 8px 0; padding:14px 18px; margin:16px 0;
                font-size:13px; color:#444;">
      <strong style="color:#8a3525;">Reason for Rejection:</strong><br>
      <span style="font-style:italic; color:#666;">"${approverComments}"</span>
    </div>` : ""}

    <div style="background:#f8f9f8; border:1px solid #e0e0e0;
                border-radius:8px; padding:16px 20px; margin:20px 0;
                font-size:13px; color:#555;">
      <strong>What you can do:</strong>
      <ul style="margin:10px 0 0; padding-left:20px; line-height:1.8;">
        <li>Speak with your manager to understand the decision</li>
        <li>Apply for different dates that work better for the team</li>
        <li>Contact HR at
          <a href="mailto:${process.env.HR_EMAIL || "hr@company.com"}"
             style="color:#2d6e33;">${process.env.HR_EMAIL || "hr@company.com"}</a>
          if you believe this was incorrect
        </li>
      </ul>
    </div>`;

  const html = wrapEmail({
    title:    "Leave Request Not Approved",
    subtitle: `${leaveType} request has been reviewed`,
    bodyHtml,
  });

  await safeSend({
    to:      employeeEmail,
    subject: `❌ Leave Not Approved — ${leaveType} (${formatDate(fromDate)})`,
    html,
    tag:     "REJECTED→EMPLOYEE",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL 5 — CANCELLED/WITHDRAWN → notify manager
// Triggered: when employee cancels/withdraws their request
// ═══════════════════════════════════════════════════════════════════════════════
async function sendLeaveCancelled({
  managerEmail,
  managerName,
  hrEmail,
  employeeName,
  employeeCode,
  leaveType,
  fromDate,
  toDate,
  durationDays,
  cancelReason,
  wasApproved,
}) {
  const status = wasApproved ? "CANCELLED" : "WITHDRAWN";

  const card = leaveDetailCard({
    employeeName, employeeCode, leaveType,
    fromDate, toDate, durationDays, status,
    reason: cancelReason,
  });

  const bodyHtml = `
    <p style="font-size:15px; color:#333; margin-top:0;">
      Hi <strong>${managerName || "Manager"}</strong>,
    </p>
    <p style="font-size:14px; color:#555; line-height:1.6;">
      <strong>${employeeName}</strong> has
      <strong>${wasApproved ? "cancelled" : "withdrawn"}</strong>
      their previously ${wasApproved ? "approved" : "submitted"} leave request.
      ${wasApproved ? "Their leave balance has been restored automatically." : ""}
    </p>

    ${card}

    ${wasApproved ? `
    <div style="background:#fff8e1; border-left:4px solid #ffc107;
                border-radius:0 8px 8px 0; padding:14px 18px; margin:20px 0;
                font-size:13px; color:#5d4037;">
      ℹ️ The leave days have been <strong>added back</strong> to
      ${employeeName}'s balance automatically. No further action needed.
    </div>` : ""}`;

  const html = wrapEmail({
    title:    `Leave ${wasApproved ? "Cancelled" : "Withdrawn"}`,
    subtitle: `${employeeName} has retracted their leave request`,
    bodyHtml,
  });

  await safeSend({
    to:      managerEmail,
    subject: `🚫 Leave ${wasApproved ? "Cancelled" : "Withdrawn"}: ${employeeName} — ${leaveType}`,
    html,
    tag:     "CANCELLED→MANAGER",
  });

  if (hrEmail && hrEmail !== managerEmail) {
    await safeSend({
      to:      hrEmail,
      subject: `[CC] Leave ${wasApproved ? "Cancelled" : "Withdrawn"}: ${employeeName} — ${leaveType}`,
      html,
      tag:     "CANCELLED→HR",
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════
module.exports = {
  sendLeaveAppliedToManager,
  sendLeaveAppliedConfirmation,
  sendLeaveApproved,
  sendLeaveRejected,
  sendLeaveCancelled,
};