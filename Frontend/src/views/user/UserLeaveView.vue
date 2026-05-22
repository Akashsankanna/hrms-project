<template>
  <UserLayout page-title="Leave Management" page-sub="Balance your workflow and wellness with ease." search-placeholder="Search resources…">

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast-notif" :class="toast.type">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline v-if="toast.type === 'success'" points="20 6 9 17 4 12"/>
          <template v-else><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></template>
        </svg>
        {{ toast.message }}
      </div>
    </transition>

    <!-- Loading shimmer -->
    <div v-if="balancesLoading" class="balance-row">
      <div v-for="i in 4" :key="i" class="bal-card shimmer"></div>
    </div>

    <!-- Leave Balance Cards -->
    <div v-else class="balance-row">
      <div
        v-for="(b, i) in balanceCards"
        :key="b.leaveTypeId"
        class="bal-card"
        :class="{ 'bal-featured': i === 1 }"
      >
        <div class="bal-type">{{ b.code }}</div>
        <div class="bal-num">{{ b.used.toFixed(1) }}</div>
        <div class="bal-total">/ {{ b.total }} days</div>
        <div class="bal-bar-wrap">
          <div
            class="bal-bar"
            :style="{
              width: b.total > 0 ? Math.min(b.used / b.total * 100, 100) + '%' : '0%',
              background: b.barColor
            }"
          ></div>
        </div>
        <div class="bal-rem">{{ b.remaining.toFixed(1) }} days remaining</div>
      </div>
      <div v-if="balanceCards.length === 0" class="bal-empty">
        No leave balances found. Contact HR to initialize your balance.
      </div>
    </div>

    <!-- Main grid: Calendar + Request Form -->
    <div class="leave-main">
      <!-- Request Form -->
      <div class="card req-card">
        <div class="req-title">Request Leave</div>

        <!-- Error -->
        <div class="rf-error" v-if="formError">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ formError }}
        </div>

        <div class="rf-field">
          <label>Leave Type</label>
          <div class="rf-select-wrap">
            <select v-model="form.leaveTypeId" class="rf-select">
              <option value="">Select leave type…</option>
              <option v-for="lt in leaveTypes" :key="lt.id" :value="lt.id">
                {{ lt.name }} 
              </option>
            </select>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div class="rf-row">
          <div class="rf-field">
            <label>From</label>
            <input type="date" v-model="form.from" class="rf-input"
              :min="todayStr"/>
          </div>
          <div class="rf-field">
            <label>To</label>
            <input type="date" v-model="form.to" class="rf-input"
              :min="form.from || todayStr"/>
          </div>
        </div>

        <!-- Half-day toggle -->
        <div class="rf-field" v-if="form.from && form.from === form.to">
          <label>Half Day?</label>
          <div class="rf-half-row">
            <button
              v-for="opt in halfDayOptions"
              :key="opt.value"
              class="half-btn"
              :class="{ active: form.halfDayIndicator === opt.value }"
              @click="form.halfDayIndicator = opt.value"
            >{{ opt.label }}</button>
          </div>
        </div>

        <div class="rf-field">
          <label>Reason <span style="color:#a03020">*</span></label>
          <textarea v-model="form.reason" class="rf-textarea" placeholder="Brief explanation…" rows="3"></textarea>
        </div>

        <!-- Medical doc URL for SL -->
        <div class="rf-field" v-if="selectedLeaveType && selectedLeaveType.requiresDoc">
          <label>Medical Document URL <span style="color:#a03020">*</span></label>
          <input type="url" v-model="form.medicalDocUrl" class="rf-input"
            placeholder="https://storage.company.com/docs/cert.pdf"/>
          <div style="font-size:11px; color:var(--stone); margin-top:4px">
            Required for {{ selectedLeaveType.name }}
          </div>
        </div>

        <div class="rf-days" v-if="daysRequested > 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {{ form.halfDayIndicator !== 'NONE' ? '0.5' : daysRequested }}
          working day{{ daysRequested !== 1 ? 's' : '' }} requested
        </div>

        <button class="rf-submit" @click="submitRequest" :disabled="submitting">
          <span v-if="!submitting">Submit Request</span>
          <span v-else class="rf-spinner"></span>
        </button>
      </div>
    </div>

    <!-- My Requests -->
    <div class="card requests-card">
      <div class="card-head" style="margin-bottom:0">
        <div class="card-title">My Requests</div>
        <div style="display:flex; gap:8px;">
          <select class="filter-select" v-model="requestStatusFilter" @change="fetchMyRequests">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div v-if="requestsLoading" class="loading-row">
        <span class="spinner"></span> Loading your requests…
      </div>

      <div v-else class="req-table-wrap">
        <table class="req-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Days</th>
              <th>Status</th>
              <th>Approver</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in myRequests" :key="r.id">
              <td>
                <span class="rt-type" :style="{ background: leaveColor(r.leaveTypeCode) + '22', color: leaveColor(r.leaveTypeCode) }">
                  {{ r.leaveTypeName }}
                </span>
              </td>
              <td class="rt-dur">
                {{ formatDate(r.fromDate) }} – {{ formatDate(r.toDate) }}
              </td>
              <td>
                <span class="days-chip">{{ r.durationDays }}d</span>
              </td>
              <td>
                <span class="rt-status" :class="'rs-' + r.status.toLowerCase()">
                  {{ r.status }}
                </span>
              </td>
              <td>
                <span v-if="r.approverName" class="approver-name-text">
                {{ r.approverName }}
              </span>
                <span v-else class="muted-text">—</span>
              </td>
              <td>
                <button
                  v-if="r.status === 'PENDING' || r.status === 'APPROVED'"
                  class="rt-cancel-btn"
                  :disabled="cancellingId === r.id"
                  @click="cancelRequest(r.id, r.status)"
                >
                  {{ cancellingId === r.id ? '…' : 'Withdraw' }}
                </button>
                <span v-else class="muted-text">—</span>
              </td>
            </tr>
            <tr v-if="myRequests.length === 0 && !requestsLoading">
              <td colspan="6" style="text-align:center; padding:32px 0; color:var(--stone); font-size:13px;">
                No leave requests found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </UserLayout>
</template>

<script>
import UserLayout from '../../components/UserLayout.vue'
import { leaveAPI } from '../../services/api.js'

// ── Leave type color map ──────────────────────────────────────────────────────
const LEAVE_COLORS = {
  EL:  '#657D65', SL:  '#f0a090', CL:  '#86d98b',
  ML:  '#9c6f0c', PL:  '#757872', BL:  '#e07070',
  COL: '#6a8faf', WFH: '#8ab4a0', LWP: '#aaaaaa',
}
function leaveColor(code) { return LEAVE_COLORS[code] || '#657D65' }

const BAR_COLORS = ['#657D65', '#A9E9AD', '#FFCFC1', '#6a8faf', '#f0d080', '#8ab4a0']

const AVATAR_BG = ['#3d5240','#657D65','#9c6f0c','#6a8faf','#a03020','#8ab4a0','#757872']
function avatarBg(name = '') {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length]
}
function initials(name = '') {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()
}

// Build date string without UTC shift (IST safe)
function localDateStr(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export default {
  name: 'UserLeaveView',
  components: { UserLayout },

  data() {
    const today = new Date()
    return {
      today,
      currentYear:  today.getFullYear(),
      currentMonth: today.getMonth(),
      todayStr:     localDateStr(today),

      // ── UI state ──────────────────────────────────────────────────────────
      balancesLoading:  true,
      requestsLoading:  false,
      submitting:       false,
      cancellingId:     null,
      formError:        '',
      toast:            { show: false, message: '', type: 'success' },
      requestStatusFilter: '',

      // ── Data from backend ─────────────────────────────────────────────────
      balances:    [],    // raw balance rows from API
      leaveTypes:  [],    // all active leave types
      myRequests:  [],    // my leave requests
      holidays:    [],    // holidays for current month (from calendar API)

      // ── Form ──────────────────────────────────────────────────────────────
      form: {
        leaveTypeId:      '',
        from:             '',
        to:               '',
        reason:           '',
        medicalDocUrl:    '',
        halfDayIndicator: 'NONE',
      },

      halfDayOptions: [
        { value: 'NONE',   label: 'Full Day'   },
        { value: 'FIRST',  label: 'First Half'  },
        { value: 'SECOND', label: 'Second Half' },
      ],
    }
  },

  // REPLACE — load balances AFTER leave types so dropdown shows correct days
async mounted() {
  await this.fetchLeaveTypes()
  await this.fetchMyBalances()   // ← waits for types first
  await Promise.all([
    this.fetchMyRequests(),
    this.fetchHolidays(),
  ])
},

  watch: {
    // Reset halfDay when date range changes to multi-day
    'form.from'(v) {
      if (v !== this.form.to) this.form.halfDayIndicator = 'NONE'
    },
    'form.to'(v) {
      if (v !== this.form.from) this.form.halfDayIndicator = 'NONE'
    },
    // Refetch holidays when month changes
    currentMonth() { this.fetchHolidays() },
    currentYear()  { this.fetchHolidays() },
  },

  computed: {
    // ── Month label ────────────────────────────────────────────────────────
    monthLabel() {
      return new Date(this.currentYear, this.currentMonth)
        .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    },

    // ── Balance cards from real data ───────────────────────────────────────
    balanceCards() {
      return this.balances
        .filter(b => b.leaveType?.code !== 'LWP' && b.leaveType?.code !== 'WFH') // hide unlimited
        .map((b, i) => ({
          leaveTypeId: b.leaveType?.id,
          code:        b.leaveType?.code || '',
          name:        b.leaveType?.name || '',
          used:        b.used,
          total:       b.openingBalance + b.accrued + b.carryForwarded,
          remaining:   b.closingBalance,
          barColor:    BAR_COLORS[i % BAR_COLORS.length],
        }))
    },

    // ── Selected leave type object ─────────────────────────────────────────
    selectedLeaveType() {
      return this.leaveTypes.find(lt => lt.id === parseInt(this.form.leaveTypeId)) || null
    },

    // ── Calendar cells ─────────────────────────────────────────────────────
    calCells() {
      const firstDay    = new Date(this.currentYear, this.currentMonth, 1).getDay()
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
      const daysInPrev  = new Date(this.currentYear, this.currentMonth, 0).getDate()
      const cells       = []

      // Build a quick lookup: date → leave status
      const leaveMap = {}
      this.myRequests.forEach(r => {
        if (!['PENDING', 'APPROVED'].includes(r.status)) return
        const from   = new Date(r.fromDate)
        const to     = new Date(r.toDate)
        const cursor = new Date(from)
        while (cursor <= to) {
          leaveMap[localDateStr(cursor)] = r.status
          cursor.setDate(cursor.getDate() + 1)
        }
      })

      // Holiday set
      const holidaySet = new Set(this.holidays.map(h => h.date?.split('T')[0]))

      // Prev month filler
      for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, currentMonth: false, date: '', isToday: false, leaveStatus: null, isHoliday: false })
      }

      // Current month days
      for (let d = 1; d <= daysInMonth; d++) {
        const dt      = new Date(this.currentYear, this.currentMonth, d)
        const dateStr = localDateStr(dt)
        cells.push({
          day:          d,
          currentMonth: true,
          date:         dateStr,
          isToday:      dateStr === this.todayStr,
          leaveStatus:  leaveMap[dateStr] || null,
          isHoliday:    holidaySet.has(dateStr),
        })
      }

      // Next month filler
      while (cells.length < 42) {
        cells.push({ day: cells.length - firstDay - daysInMonth + 1, currentMonth: false, date: '', isToday: false, leaveStatus: null, isHoliday: false })
      }

      return cells
    },

    // ── Working days calculation (excludes Sundays + holidays) ─────────────
    daysRequested() {
      if (!this.form.from || !this.form.to) return 0
      const from = new Date(this.form.from)
      const to   = new Date(this.form.to)
      if (to < from) return 0

      const holidaySet = new Set(this.holidays.map(h => h.date?.split('T')[0]))
      let count = 0
      const cursor = new Date(from)
      while (cursor <= to) {
        const dow     = cursor.getDay()
        const dateStr = localDateStr(cursor)
        if (dow !== 0 && !holidaySet.has(dateStr)) count++
        cursor.setDate(cursor.getDate() + 1)
      }
      return count
    },
  },

  methods: {
    // ── FETCH ─────────────────────────────────────────────────────────────────

    async fetchLeaveTypes() {
      try {
        const res       = await leaveAPI.getLeaveTypes()
        this.leaveTypes = res.data?.leaveTypes || []
        // Set default selection to first type
        if (this.leaveTypes.length && !this.form.leaveTypeId) {
          this.form.leaveTypeId = this.leaveTypes[0].id
        }
      } catch (err) {
        console.warn('[fetchLeaveTypes]', err)
      }
    },

    async fetchMyBalances() {
      this.balancesLoading = true
      try {
        const year = new Date().getFullYear()
        const res  = await leaveAPI.getMyBalances({ year })
        this.balances = res.data?.balances || []
      } catch (err) {
        console.warn('[fetchMyBalances]', err)
        this.balances = []
      } finally {
        this.balancesLoading = false
      }
    },

    async fetchMyRequests() {
      this.requestsLoading = true
      try {
        const params = {
          year:  new Date().getFullYear(),
          limit: 50,
          ...(this.requestStatusFilter ? { status: this.requestStatusFilter } : {}),
        }
        const res = await leaveAPI.getMyRequests(params)

        this.myRequests = (res.data?.requests || []).map(r => {
          // Find L1 approver from approvals array
         const approvalRow = r.approvals?.find(a =>
            ['APPROVED', 'PENDING', 'REJECTED'].includes(a.action)
          ) || r.approvals?.[0]

          // Show designation/role instead of personal name
        
       // REPLACE WITH THIS
      const approverName = approvalRow?.approver
        ? (approvalRow.approver.designation?.name
          || approvalRow.approver.user?.role?.name
          || 'Admin')   // ← fallback label
        : null

          return {
            id:             r.id,
            leaveTypeCode:  r.leaveType?.code  || '',
            leaveTypeName:  r.leaveType?.name  || '',
            fromDate:       r.fromDate,
            toDate:         r.toDate,
            durationDays:   parseFloat(r.durationDays || 0),
            status:         r.status,
            reason:         r.reason || '',
            approverName,
            approverInitials: approverName ? initials(approverName) : '',
          }
        })
      } catch (err) {
        console.warn('[fetchMyRequests]', err)
        this.myRequests = []
      } finally {
        this.requestsLoading = false
      }
    },

    async fetchHolidays() {
      try {
        // Use calendar holidays endpoint
        const year  = this.currentYear
        const month = this.currentMonth + 1
        const res   = await import('../../services/api.js').then(m =>
          m.calendarAPI.getHolidays({ year, month })
        )
        this.holidays = res.data?.holidays || []
      } catch (err) {
        // Silently fail — holidays are optional for display
        console.warn('[fetchHolidays]', err)
        this.holidays = []
      }
    },

    // ── SUBMIT LEAVE REQUEST ──────────────────────────────────────────────────
    async submitRequest() {
      this.formError = ''

      // Validation
      if (!this.form.leaveTypeId) {
        this.formError = 'Please select a leave type'
        return
      }
      if (!this.form.from || !this.form.to) {
        this.formError = 'Please select from and to dates'
        return
      }
      if (new Date(this.form.to) < new Date(this.form.from)) {
        this.formError = '"To" date must be on or after "From" date'
        return
      }
      if (this.daysRequested === 0 && this.form.halfDayIndicator === 'NONE') {
        this.formError = 'No working days in the selected range'
        return
      }
      
      if (this.selectedLeaveType?.requiresDoc && !this.form.medicalDocUrl) {
        this.formError = `Medical document URL is required for ${this.selectedLeaveType.name}`
        return
      }

      this.submitting = true
      try {
        await leaveAPI.applyLeave({
          leaveTypeId:      parseInt(this.form.leaveTypeId),
          fromDate:         this.form.from,
          toDate:           this.form.to,
          reason:           this.form.reason   || null,
          medicalDocUrl:    this.form.medicalDocUrl || null,
          halfDayIndicator: this.form.halfDayIndicator,
        })

        // Reset form
        this.form = {
          leaveTypeId:      this.leaveTypes[0]?.id || '',
          from:             '',
          to:               '',
          reason:           '',
          medicalDocUrl:    '',
          halfDayIndicator: 'NONE',
        }

        // Refresh data
        await Promise.all([
          this.fetchMyBalances(),
          this.fetchMyRequests(),
        ])

        this.showToast('Leave request submitted successfully!', 'success')
      } catch (err) {
        const msg = err?.response?.data?.error || 'Failed to submit leave request'
        this.formError = msg
        this.showToast(msg, 'error')
      } finally {
        this.submitting = false
      }
    },

    // ── CANCEL / WITHDRAW REQUEST ─────────────────────────────────────────────
    async cancelRequest(id, currentStatus) {
      const label = currentStatus === 'PENDING' ? 'withdraw' : 'cancel'
      if (!confirm(`Are you sure you want to ${label} this leave request?`)) return

      this.cancellingId = id
      try {
        await leaveAPI.cancelRequest(id, { cancelReason: 'Withdrawn by employee' })
        await Promise.all([
          this.fetchMyBalances(),
          this.fetchMyRequests(),
        ])
        this.showToast('Leave request withdrawn successfully', 'success')
      } catch (err) {
        this.showToast(err?.response?.data?.error || 'Failed to withdraw request', 'error')
      } finally {
        this.cancellingId = null
      }
    },

    // ── CALENDAR CLICK — click-to-select date range ────────────────────────
    handleCellClick(cell) {
      if (!cell.currentMonth || !cell.date) return
      if (!this.form.from || (this.form.from && this.form.to)) {
        // Start new selection
        this.form.from = cell.date
        this.form.to   = cell.date
      } else {
        // Extend to end date
        if (cell.date >= this.form.from) {
          this.form.to = cell.date
        } else {
          this.form.from = cell.date
          this.form.to   = cell.date
        }
      }
    },

    isInRange(date) {
      if (!date || !this.form.from || !this.form.to) return false
      return date > this.form.from && date < this.form.to
    },

    // ── HELPERS ───────────────────────────────────────────────────────────────
    leaveColor(code)   { return leaveColor(code) },
    avatarBg(name)     { return avatarBg(name) },

    prevMonth() {
      if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear-- }
      else this.currentMonth--
    },
    nextMonth() {
      if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++ }
      else this.currentMonth++
    },

    formatDate(raw) {
      if (!raw) return '—'
      const dateStr = raw.split('T')[0]
      const [y, m, d] = dateStr.split('-')
      return new Date(+y, +m - 1, +d)
        .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    },

          availableDays(leaveTypeId) {
        if (this.balancesLoading) return '...'
        const bal = this.balances.find(b => Number(b.leaveType?.id) === Number(leaveTypeId))
        if (!bal) return '0'
        return Number(bal.closingBalance ?? 0).toFixed(1)
      },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    },
  },
}
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
/* ── Toast ─────────────────────────────────────────────────────────────────── */
.toast-notif {
  position: fixed; bottom: 28px; right: 28px; z-index: 9999;
  display: flex; align-items: center; gap: 10px;
  padding: 13px 20px; border-radius: 12px;
  font-size: 13px; font-weight: 600;
  font-family: var(--font-sans); box-shadow: 0 8px 32px rgba(0,0,0,.14);
}
.toast-notif.success { background: #1a2e1a; color: #a8e6b0; }
.toast-notif.error   { background: #3a1212; color: #ffcfc1; }
.toast-enter-active  { animation: toastIn .25s ease; }
.toast-leave-active  { animation: toastIn .2s ease reverse; }
@keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }

/* ── Shimmer ────────────────────────────────────────────────────────────────── */
.shimmer {
  background: linear-gradient(90deg, #f0f0ee 25%, #e8ece4 50%, #f0f0ee 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  min-height: 120px;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Cards shared ───────────────────────────────────────────────────────────── */
.card { background: #fff; border-radius: var(--r-xl); padding: 24px; border: 1px solid #e8ece4; }
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.card-title { font-family: var(--font-serif); font-size: 17px; color: #1e261f; }

/* ── Balance row ───────────────────────────────────────────────────────────── */
.balance-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; margin-bottom: 28px; }
@media (max-width:900px) { .balance-row { grid-template-columns: repeat(2,1fr); } }
@media (max-width:540px) { .balance-row { grid-template-columns: 1fr; } }

.bal-card {
  background: #fff; border: 1px solid #e8ece4; border-radius: var(--r-xl); padding: 22px 24px;
}
.bal-featured { background: #3d5240; border-color: #3d5240; }
.bal-featured .bal-type  { color: rgba(255,255,255,.5); }
.bal-featured .bal-num   { color: #a8e6b0; }
.bal-featured .bal-total { color: rgba(255,255,255,.4); }
.bal-featured .bal-rem   { color: rgba(255,255,255,.4); }
.bal-featured .bal-bar-wrap { background: rgba(255,255,255,.1); }
.bal-empty { grid-column: 1/-1; text-align:center; padding:24px; font-size:13px; color:var(--stone); }

.bal-type  { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: var(--stone); margin-bottom: 10px; }
.bal-num   { font-family: var(--font-serif); font-size: 38px; color: #1e261f; line-height: 1; }
.bal-total { font-size: 13px; color: var(--stone); margin-top: 2px; margin-bottom: 14px; }
.bal-bar-wrap { height: 4px; background: #eef0ec; border-radius: 4px; overflow: hidden; margin-bottom: 8px; }
.bal-bar  { height: 100%; border-radius: 4px; transition: width .5s ease; }
.bal-rem  { font-size: 11.5px; color: var(--stone); }

/* ── Main grid ──────────────────────────────────────────────────────────────── */

.leave-main {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;
   width: 100%;
}
@media (max-width: 900px) {
  .leave-main {
    flex-direction: column;
    align-items: stretch;
  }
}
/* ── Calendar ───────────────────────────────────────────────────────────────── */
.cal-nav { display: flex; align-items: center; gap: 12px; }
.cn-btn {
  width: 28px; height: 28px; border: 1px solid #e4e8e0; background: #fff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background .15s;
}
.cn-btn:hover { background: #f0f5f0; }
.cn-btn svg   { width: 14px; height: 14px; color: var(--forest); }
.cal-month    { font-family: var(--font-serif); font-size: 18px; color: #1e261f; }

.cal-days { display: grid; grid-template-columns: repeat(7,1fr); margin-bottom: 4px; }
.cal-dl   { text-align: center; font-size: 10px; font-weight: 700; color: #b0b5ae; padding: 8px 0; letter-spacing: .5px; }

.cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; margin-bottom: 16px; }
.cal-cell {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  aspect-ratio: 1; border-radius: var(--r-sm); cursor: pointer;
  transition: background .15s; position: relative; gap: 2px;
}
.cal-cell:hover:not(.other) { background: #f0f5f0; }
.cal-cell.other   .cell-num { color: #d0d4ce; cursor: default; }
.cal-cell.today               { background: #3d5240; }
.cal-cell.today   .cell-num   { color: #fff; font-weight: 700; }
.cal-cell.selected:not(.today){ background: rgba(169,233,173,.4); outline: 2px solid #657D65; outline-offset: -1px; }
.cal-cell.in-range:not(.today){ background: rgba(169,233,173,.15); }
.cell-num { font-size: 13px; font-weight: 500; color: #1e261f; line-height: 1; }
.cell-leave-dot { width: 5px; height: 5px; border-radius: 50%; }
.dot-annual { background: #657D65; }
.dot-other  { background: #f0a090; }

.cal-legend { display: flex; gap: 16px; flex-wrap: wrap; }
.cl-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--stone); }
.cl-dot  { width: 8px; height: 8px; border-radius: 50%; }
.cl-dot.annual  { background: #657D65; }
.cl-dot.other   { background: #f0a090; }
.cl-dot.holiday { background: #9c6f0c; }

/* ── Request Form ─────────────────────────────────────────── */
.req-card {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #e8ece4;
  box-shadow: 0 4px 18px rgba(0,0,0,0.04);
  width: 100%;
  max-width: 720px; 
  margin: 0 auto;
}

.req-title {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  color: #1e261f;
  margin-bottom: 24px;
  font-weight: 400;
}

.rf-error {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  background: rgba(255,207,193,.2);
  border: 1px solid rgba(255,150,130,.4);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12px;
  color: #8a3525;
}

.rf-field {
  margin-bottom: 18px;
}

.rf-field label {
  display: block;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  color: #8aaa8a;
  margin-bottom: 8px;
}

.rf-select-wrap {
  position: relative;
}

.rf-select {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  background: #f8faf8;
  border: 1.5px solid #dde3da;
  border-radius: 10px;
  padding: 12px 36px 12px 14px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  color: #1e261f;
  outline: none;
  cursor: pointer;
  transition: border-color .18s;
}

.rf-select:focus {
  border-color: #86d98b;
  box-shadow: 0 0 0 3px rgba(134,217,139,.15);
}

.rf-select-wrap svg {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #8aaa8a;
  pointer-events: none;
}

.rf-select option {
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  padding: 8px 14px;
  color: #1e261f;
  background: #fff;
}

.rf-input {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: #f8faf8;
  border: 1.5px solid #dde3da;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13.5px;
  font-family: 'DM Sans', sans-serif;
  color: #1e261f;
  outline: none;
  transition: border-color .18s;
}

.req-card {
  overflow: visible; 
  box-sizing: border-box;
  width: 100%;
}

.rf-input:focus {
  border-color: #86d98b;
  box-shadow: 0 0 0 3px rgba(134,217,139,.15);
}

.rf-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px; 
}

@media (max-width: 640px) {
  .rf-row {
    grid-template-columns: 1fr;
  }
}

.rf-textarea {
  width: 100%;
  background: #f8faf8;
  border: 1.5px solid #dde3da;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  color: #1e261f;
  outline: none;
  resize: vertical;
  transition: border-color .18s;
  min-height: 90px;
}

.rf-textarea:focus {
  border-color: #86d98b;
  box-shadow: 0 0 0 3px rgba(134,217,139,.15);
}

.rf-textarea::placeholder { color: #b8bdb6; }

/* Half-day toggle */
.rf-half-row { display: flex; gap: 8px; }

.half-btn {
  flex: 1;
  padding: 9px;
  border: 1.5px solid #dde3da;
  border-radius: 10px;
  background: #f8faf8;
  font-size: 12px;
  font-weight: 500;
  color: #8aaa8a;
  cursor: pointer;
  transition: all .15s;
  font-family: 'DM Sans', sans-serif;
}

.half-btn.active {
  background: #3d5240;
  color: #fff;
  border-color: #3d5240;
}

.rf-days {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(169,233,173,.2);
  border: 1px solid rgba(134,217,139,.3);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #2d5c32;
  font-weight: 600;
  margin-bottom: 18px;
}

.rf-days svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #657D65;
}

.rf-submit {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #3d5240, #657D65);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: opacity .18s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  letter-spacing: 0.3px;
}

.rf-submit:hover:not(:disabled) { opacity: 0.88; }
.rf-submit:disabled { opacity: .6; cursor: not-allowed; }

.rf-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── My Requests table ──────────────────────────────────────────────────────── */
.filter-select {
  border: 1px solid #e4e8e0; background: #fff; border-radius: var(--r-sm);
  padding: 6px 12px; font-size: 12.5px; font-family: var(--font-sans);
  color: #1e261f; outline: none; cursor: pointer;
}

.loading-row { display: flex; align-items: center; gap: 10px; padding: 32px; color: var(--stone); font-size: 13px; }
.spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid #e8ece4; border-top-color: #657D65;
  border-radius: 50%; animation: spin .65s linear infinite;
}

.req-table-wrap { overflow-x: auto;  border-radius: 14px;
  border: 1px solid #eef0ec; }
.req-table { width: 100%; border-collapse: separate; border-spacing: 0;}
.req-table thead th {
  padding: 10px 18px; text-align: left; font-size: 10.5px; font-weight: 700;
  text-transform: uppercase; letter-spacing: .6px; color: var(--stone);
  background: #f8faf8; border-bottom: 1px solid #eef0ec;
}
.req-table tbody tr { border-bottom: 1px solid #eef0ec; transition: background .15s; }
.req-table tbody tr:last-child { border-bottom: none; }
.req-table tbody tr:hover { background: #f8faf8; }
.req-table td { padding:18px;vertical-align: middle; }

.rt-type {
  font-size: 12px; font-weight: 600; padding: 3px 11px; border-radius: 20px;
}
.rt-dur { font-size: 13px; color: #4a5a4b; }

.days-chip {
  background: #f0f0ee; color: var(--stone);
  font-size: 11.5px; font-weight: 700; padding: 2px 9px; border-radius: 20px;
}

.rt-status { font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 20px; }
.rs-approved  { background: rgba(169,233,173,.3); color: #2d5c32; }
.rs-pending   { background: rgba(255,207,193,.35); color: #8a3525; }
.rs-rejected  { background: rgba(255,207,193,.35); color: #8a3525; }
.rs-cancelled { background: #f0f0ee; color: var(--stone); }
.rs-withdrawn { background: #f0f0ee; color: var(--stone); }

.rt-approver {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #4a5a4b;
}
.app-av {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.muted-text { color: #b0b5ae; font-size: 12px; }

.rt-cancel-btn {
  padding: 5px 12px; border: 1px solid #e4e8e0; border-radius: var(--r-xs);
  background: #fff; font-size: 11.5px; font-weight: 600; color: #8a3525;
  cursor: pointer; font-family: var(--font-sans); transition: all .15s;
}
.rt-cancel-btn:hover:not(:disabled) { background: rgba(255,207,193,.25); border-color: #ffcfc1; }
.rt-cancel-btn:disabled { opacity: .5; cursor: not-allowed; }


.approver-name-text {
  font-size: 13px;
  color: #4a5a4b;
  font-weight: 500;
}
:deep(.page-content),
:deep(.user-layout-content) {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.requests-card,
.req-card,
.bal-card {
  transition: all 0.2s ease;
}

.requests-card:hover,
.req-card:hover,
.bal-card:hover {
  transform: translateY(-1px);
}
</style>