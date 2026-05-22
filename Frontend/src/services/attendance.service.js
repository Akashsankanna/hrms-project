// src/services/attendance.service.js
// Attendance API Service — clean abstraction over axios client

import apiClient from './api'


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map backend status codes → display strings used in the UI
 */
export const STATUS_MAP = {
  PRESENT:    'Present',
  ABSENT:     'Absent',
  HALF_DAY:   'Half Day',
  ON_LEAVE:   'On Leave',
  INCOMPLETE: 'Incomplete',
  WFH:        'WFH',
  HOLIDAY:    'Holiday',
  WEEKEND:    'Weekend',
}

/**
 * Reverse map for tab → backend status filter
 */
export const TAB_TO_STATUS = {
  All:       null,
  Present:   'PRESENT',
  Absent:    'ABSENT',
  Late:      'LATE',         // synthetic filter — applied client-side on lateByMinutes > 0
  'On Leave':'ON_LEAVE',
  'Half Day':'HALF_DAY',
}

/**
 * Format HH:MM:SS or ISO timestamp → "HH:MM AM/PM"
 */
export function formatTime(raw) {
  if (!raw) return null
  const d = new Date(raw)
  if (isNaN(d.getTime())) return null
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

/**
 * Derive initials from a name string
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
}

/**
 * Deterministic avatar color from a string
 */
const AVATAR_PALETTE = [
  '#4a7c59','#7a5c4a','#4a5c7a','#7a4a6a',
  '#5a7a4a','#6a4a7a','#4a7a7a','#7a6a4a',
]
export function avatarColor(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALIZERS — convert backend payload → UI record shape
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise a single attendance summary row from the backend into a
 * UI-friendly record object.
 *
 * Backend shape (AttendanceSummary + joins):
 * {
 *   employeeId, attendanceDate,
 *   firstCheckIn, lastCheckOut, totalHours,
 *   status, lateByMinutes, overtimeMinutes,
 *   employee: { employeeCode, firstName, lastName, workEmail,
 *               department: { name }, designation: { name } }
 * }
 */
export function normalizeSummaryRecord(raw) {
  const emp     = raw.employee || {}
  const deptName = emp.department?.name || 'General'
  const name    = `${emp.firstName || ''} ${emp.lastName || ''}`.trim()

  return {
    id:          raw.employeeId,
    empCode:     emp.employeeCode || `EMP-${String(raw.employeeId).padStart(3, '0')}`,
    name,
    initials:    getInitials(name),
    color:       avatarColor(name),
    department:  deptName,
    designation: emp.designation?.name || '',
    email:       emp.workEmail || '',

    checkIn:     formatTime(raw.firstCheckIn),
    checkOut:    formatTime(raw.lastCheckOut),
    hours:       raw.totalHours != null ? parseFloat(raw.totalHours) : null,

    // Normalise status to display string
    status:      STATUS_MAP[raw.status] || raw.status || 'Absent',
    statusRaw:   raw.status,

    late:           (raw.lateByMinutes || 0) > 0,
    lateByMinutes:  raw.lateByMinutes || 0,
    overtimeMinutes: raw.overtimeMinutes || 0,

    note:        raw.remarks || '',
  }
}

/**
 * Normalise a raw AttendanceLog row (punch log) for the table.
 */
export function normalizeLogRecord(raw) {
  const emp     = raw.employee || {}
  const name    = `${emp.firstName || ''} ${emp.lastName || ''}`.trim()

  return {
    id:         raw.id,
    empCode:    emp.employeeCode || '',
    name,
    initials:   getInitials(name),
    color:      avatarColor(name),
    department: emp.department?.name || 'General',

    checkIn:    raw.punchType === 'CHECK_IN'  ? formatTime(raw.punchTime) : null,
    checkOut:   raw.punchType === 'CHECK_OUT' ? formatTime(raw.punchTime) : null,
    hours:      null,
    status:     'Present',
    late:       false,
    lateByMinutes: 0,
    note:       raw.remarks || '',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API CALLS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all employee attendance summaries for a given date.
 *
 * We call the legacy summary endpoint with a date range of a single day.
 * The backend returns AttendanceSummary rows.
 *
 * GET /api/attendance/legacy-summary/:employeeCode?from=DATE&to=DATE
 *
 * For a team-level view we call for each employee or rely on a bulk endpoint.
 * If your backend exposes GET /api/attendance/team-summary?date=... use that.
 *
 * @param {Object} params
 * @param {string} params.date        - YYYY-MM-DD
 * @param {string} [params.department]
 * @param {number} [params.page]
 * @param {number} [params.limit]
 */



function getColor(code = '') {
  const colors = ['#6C9', '#F96', '#69F', '#C6F', '#6C9']
  return colors[code.charCodeAt(0) % colors.length]
}

function mapStatus(s) {
  if (!s.firstCheckIn) return 'Absent'

  if (s.status === 'HALF_DAY') return 'Half Day'
  if (s.lateByMinutes > 0) return 'Late'

  return 'Present'
}


function normalizeAdminRecords(summaries) {
  return summaries.map(s => {
    const emp = s.employee || {}

    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim()

    return {
      id: s.employeeId,

      name: fullName,
      empCode: emp.employeeCode || '',

      department: emp.department?.name || '-',

      // 🔥 FIX: ensure proper date parsing
      checkIn: s.firstCheckIn ? formatTime(String(s.firstCheckIn)) : null,
      checkOut: s.lastCheckOut ? formatTime(String(s.lastCheckOut)) : null,

      hours: s.totalHours != null ? Number(s.totalHours) : null,

      status: mapStatus(s),

      late: (s.lateByMinutes || 0) > 0,
      lateByMinutes: s.lateByMinutes || 0,

      note: s.remarks || null,

      // 🔥 FIXED
      initials: getInitials(fullName),
      color: getColor(emp.employeeCode || 'EMP'),
    }
  })
}

export async function fetchDailySummaries({ date, department, page, limit }) {
  const res = await apiClient.get('/attendance/team-summary', {
    params: { date, department, page, limit }
  })

  const data = res.data

  return {
    records: normalizeAdminRecords(data.summaries || []),
    total: data.total || 0
  }
}

/**
 * Fetch attendance summary for a single employee on a date.
 * GET /api/attendance/summary/:employeeId?date=YYYY-MM-DD
 */
export async function fetchEmployeeSummary(employeeId, date) {
  const res = await apiClient.get(`/attendance/summary/${employeeId}`, {
    params: { date },
  })
  return res.data.summary
}

/**
 * Fetch raw punch logs for an employee.
 * GET /api/attendance/logs/:employeeCode?from=DATE&to=DATE
 */
export async function fetchAttendanceLogs(employeeCode, { from, to, page = 1, limit = 50 } = {}) {
  const res = await apiClient.get(`/attendance/logs/${employeeCode}`, {
    params: { from, to, page, limit },
  })
  return {
    logs:  (res.data.logs || []).map(normalizeLogRecord),
    total: res.data.total || 0,
  }
}

/**
 * Mark / save attendance (admin).
 * POST /api/attendance/punch
 */
export async function markAttendance({ employeeCode, punchType, date, latitude, longitude, source = 'WEB' }) {
  const res = await apiClient.post('/attendance/punch', {
    employeeCode,
    punchType,
    date,
    latitude,
    longitude,
    source,
  })
  return res.data
}

/**
 * Fetch monthly overview data (aggregate presence % per day).
 * This calls team-summary for the full month and computes percentages.
 *
 * If your backend has a dedicated monthly endpoint, swap this out.
 */
export async function fetchMonthlyOverview(year, month) {
  const from  = `${year}-${String(month).padStart(2,'0')}-01`
  const daysInMonth = new Date(year, month, 0).getDate()
  const to    = `${year}-${String(month).padStart(2,'0')}-${daysInMonth}`

  try {
    const res = await apiClient.get('/attendance/monthly-overview', {
      params: { from, to },
    })
    return res.data.dailyStats || []
  } catch {
    // Fallback — return empty array; component shows placeholder bars
    return []
  }
}

/**
 * Compute KPIs from a normalised records array (pure, no API call).
 */
export function computeKPIs(records) {
  const total   = records.length
  const present = records.filter(r => ['Present', 'WFH'].includes(r.status)).length
  const absent  = records.filter(r => r.status === 'Absent').length
  const late    = records.filter(r => r.late).length
  const onLeave = records.filter(r => r.status === 'On Leave').length

  const hoursArr = records.filter(r => r.hours != null).map(r => r.hours)
  const avgHours = hoursArr.length
  ? Number(hoursArr.reduce((s, h) => s + h, 0) / hoursArr.length).toFixed(1)
  : '—'

  return { total, present, absent, late, onLeave, avgHours }
}

export async function fetchEmployeeList() {
  const res = await apiClient.get('/users/employees', { params: { limit: 200 } })
  return res.data.employees || res.data.records || res.data || []
}