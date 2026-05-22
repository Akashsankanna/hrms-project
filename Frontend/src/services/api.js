import axios from 'axios'

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocalhost
  ? "http://localhost:3000/api"
  : "http://10.73.160.55:3000/api"
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");

        console.log("REFRESH TOKEN:", refreshToken); // 🔥 DEBUG

        const res = await axios.post(
          "http://localhost:3000/api/auth/refresh",
          {
            refresh_token: refreshToken   // ✅ FIX HERE
          }
        );

        const newAccessToken = res.data.access_token;

        // ✅ SAVE NEW TOKEN
        sessionStorage.setItem("hrms_token", newAccessToken);
        localStorage.setItem("hrms_token", newAccessToken);

        // ✅ RETRY REQUEST
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (err) {
        console.error("Refresh failed:", err);

        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  login:          (email, password)    => apiClient.post('/auth/login',           { email, password }),
  logout:         (refresh_token)      => apiClient.post('/auth/logout',          { refresh_token }),
  changePassword: (email, newPassword) => apiClient.post('/auth/change-password', { email, newPassword }),
}

export const adminAPI = {
  getProfile:     ()       => apiClient.get('/admin/profile'),
  listEmployees:  ()       => apiClient.get('/admin/employees'),
  createEmployee: (data)   => apiClient.post('/admin/employees', data),
}

export const userAPI = {
  createEmployee: (data) => apiClient.post('/users/create-employee', data),
  listEmployees:  ()     => apiClient.get('/users/employees'),
}

export const profileAPI = {
  get:                   (code)       => apiClient.get(`/employees/${code}/personal`),
  upsertPersonalBasic:   (code, data) => apiClient.put(`/employees/${code}/personal/basic`, data),
  upsertAddress:         (code, data) => apiClient.put(`/employees/${code}/address`, data),
  upsertIdentity:        (code, data) => apiClient.put(`/employees/${code}/identity`, data),
  addPreviousEmployment: (code, data) => apiClient.put(`/employees/${code}/previous-employment`, data),
  addEducation:          (code, data) => apiClient.put(`/employees/${code}/education`, data),
  addDocument:           (code, data) => apiClient.put(`/employees/${code}/document`, data),
}

export const attendanceAPI = {
  punch:          (data)         => apiClient.post('/attendance/punch-in', data),
  punchOut:       (data)         => apiClient.post('/attendance/punch-out', data),
  assignShift:    (data)         => apiClient.post('/attendance/assign-shift', data),
  computeSummary: (data)         => apiClient.post('/attendance/compute-summary', data),
  getLogs:        (code, params) => apiClient.get(`/attendance/${code}`, { params }),
  getSummary:     (code, params) => apiClient.get(`/attendance/summary/${code}`, { params }),
  regularize:     (logId, data)  => apiClient.put(`/attendance/regularize/${logId}`, data),
}

// ── Calendar API ──────────────────────────────────────────────────────────────
export const calendarAPI = {
  // Holidays
  getHolidays:   (params)   => apiClient.get('/calendar/holidays', { params }),
  createHoliday: (data)     => apiClient.post('/calendar/holidays', data),
  updateHoliday: (id, data) => apiClient.put(`/calendar/holidays/${id}`, data),
  deleteHoliday: (id)       => apiClient.delete(`/calendar/holidays/${id}`),
 
  // Events
  getEvents:    (params)    => apiClient.get('/calendar/events', { params }),
  getEventById: (id)        => apiClient.get(`/calendar/events/${id}`),
  createEvent:  (data)      => apiClient.post('/calendar/events', data),
  updateEvent:  (id, data)  => apiClient.put(`/calendar/events/${id}`, data),
  deleteEvent:  (id)        => apiClient.delete(`/calendar/events/${id}`),
 
  // Attendees / RSVP
  rsvp:   (id, status) => apiClient.put(`/calendar/events/${id}/rsvp`, { rsvpStatus: status }),
  invite: (id, empIds) => apiClient.post(`/calendar/events/${id}/invite`, { employeeIds: empIds }),
 
  // Notifications
  getNotifications:      ()   => apiClient.get('/calendar/notifications'),
  markNotificationRead:  (id) => apiClient.put(`/calendar/notifications/${id}/read`),
  markAllRead:           ()   => apiClient.put('/calendar/notifications/read-all'),
 
  // Views
  getMyCalendar:    (params) => apiClient.get('/calendar/my-calendar',    { params }),
  getTeamView:      (params) => apiClient.get('/calendar/team-view',      { params }),
  getUpcoming:      (params) => apiClient.get('/calendar/upcoming',        { params }),
  getAdminOverview: (params) => apiClient.get('/calendar/admin/overview',  { params }),
}


export const leaveAPI = {
  // ── Leave Types ─────────────────────────────────────────────────────────────
  // GET /api/leave/types
  getLeaveTypes:    (params)      => apiClient.get('/leaves/types', { params }),
 
  // POST /api/leave/types  (admin)
  createLeaveType:  (data)        => apiClient.post('/leave/types', data),
 
  // PUT /api/leave/types/:id  (admin)
  updateLeaveType:  (id, data)    => apiClient.put(`/leave/types/${id}`, data),
 
  // ── Balances ─────────────────────────────────────────────────────────────────
  // GET /api/leave/balances/my?year=2026
  getMyBalances:    (params)      => apiClient.get('/leave/balances/my', { params }),
 
  // GET /api/leave/balances/:employeeCode?year=2026
  getEmployeeBalances: (code, params) => apiClient.get(`/leave/balances/${code}`, { params }),
 
  // PUT /api/leave/balances/adjust  (admin)
  adjustBalance:    (data)        => apiClient.put('/leave/balances/adjust', data),
 
  // POST /api/leave/balances/initialize-year  (admin)
  initializeYear:   (data)        => apiClient.post('/leave/balances/initialize-year', data),
 
  // ── Requests ─────────────────────────────────────────────────────────────────
  // POST /api/leave/requests  (employee applies)
  applyLeave:       (data)        => apiClient.post('/leaves/requests', data),
 
  // GET /api/leave/requests/my?status=PENDING&year=2026
  getMyRequests:    (params)      => apiClient.get('/leaves/requests/my', { params }),
 
  // GET /api/leave/requests/pending-approvals  (manager)
  getPendingApprovals: (params)   => apiClient.get('/leaves/requests/pending-approvals', { params }),
 
  // GET /api/leave/requests?status=PENDING&page=1  (admin)
  getAllRequests:    (params)      => apiClient.get('/leaves/requests', { params }),
 
  // GET /api/leave/requests/:id
  getRequestById:   (id)          => apiClient.get(`/leave/requests/${id}`),
 
  // PUT /api/leave/requests/:id/cancel  (employee cancels own request)
  cancelRequest:    (id, data)    => apiClient.put(`/leave/requests/${id}/cancel`, data),
 
  // ── Approvals ────────────────────────────────────────────────────────────────
  // PUT /api/leave/requests/:id/approve  body: { action: "APPROVED"|"REJECTED", comments? }
  approveRequest:   (id, data)    => apiClient.put(`/leaves/requests/${id}/approve`, data),
 
  // POST /api/leave/requests/:id/escalate  body: { nextApproverId }
  escalateRequest:  (id, data)    => apiClient.post(`/leave/requests/${id}/escalate`, data),
 
  // ── Dashboard / Reports ──────────────────────────────────────────────────────
  // GET /api/leave/dashboard/summary  (admin)
  getDashboardSummary: (params)   => apiClient.get('/leaves/dashboard/summary', { params }),
 
  // GET /api/leave/team-calendar?from=2026-05-01&to=2026-05-31
  getTeamCalendar:  (params)      => apiClient.get('/leave/team-calendar', { params }),
}

export const lookupAPI = {
  getByCode:          (code) => apiClient.get(`/lookups/${code}`),
  getCountries:       ()     => apiClient.get('/lookups/geo/countries'),
  getStatesByCountry: (cId)  => apiClient.get(`/lookups/geo/countries/${cId}/states`),
  getCitiesByState:   (sId)  => apiClient.get(`/lookups/geo/states/${sId}/cities`),
  getDepartments:     ()     => apiClient.get('/lookups/org/departments'),
  getDesignations:    ()     => apiClient.get('/lookups/org/designations'),
  getOfficeLocations: ()     => apiClient.get('/lookups/org/office-locations'),
  getPayGrades:       ()     => apiClient.get('/lookups/org/pay-grades'),
  getShifts:          ()     => apiClient.get('/lookups/org/shifts'),
  getEmploymentTypes: ()     => apiClient.get('/lookups/employment-types'),  // ← ADD THIS
}

export default apiClient
