<template>
  <UserLayout page-title="Attendance" page-sub="Track your daily presence and work hours.">

    <!-- ── Stats Strip ─────────────────────────────────────────── -->
    <div class="stats-row">
      <div v-for="s in summaryStats" :key="s.label" class="stat-card" :class="s.featured ? 'stat-featured' : ''">
        <div class="stat-icon" :class="s.iconCls">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="s.icon"></svg>
        </div>
        <div class="stat-val" :style="{ color: s.color }">{{ s.val }}</div>
        <div class="stat-lbl">{{ s.label }}</div>
      </div>
    </div>

    <!-- ── Main two-col grid ───────────────────────────────────── -->
    <div class="att-main">

      <!-- Clock widget -->
      <div class="card clock-card">
        <div class="cc-head">
          <div>
            <div class="card-eyebrow">Today</div>
            <div class="card-title" style="margin-bottom:4px">{{ todayFormatted }}</div>
            <div class="cc-time">{{ currentTime }}</div>
          </div>
          <div class="cc-badge" :class="isClockedIn ? 'clocked' : 'not-clocked'">
            {{ isClockedIn ? '● Clocked In' : '○ Not Clocked In' }}
          </div>
        </div>

        <!-- Check-in / out times row -->
        <div class="cc-times" v-if="isClockedIn || isCompletedToday">
          <div class="cc-time-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <div class="cc-tl">Check In</div>
              <div class="cc-tv">{{ punchState.checkIn || '—' }}</div>
            </div>
          </div>
          <div class="cc-time-divider"></div>
          <div class="cc-time-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <div>
              <div class="cc-tl">{{ isCompletedToday ? 'Check Out' : 'Shift End' }}</div>
              <div class="cc-tv">{{ isCompletedToday ? (punchState.checkOut || '—') : '06:00 PM' }}</div>
            </div>
          </div>
        </div>

        <!-- Late warning -->
        <div v-if="todaySummary && todaySummary.lateByMinutes > 0" class="late-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Late by {{ todaySummary.lateByMinutes }} minute{{ todaySummary.lateByMinutes === 1 ? '' : 's' }}
        </div>

        <!-- GPS Status Bar -->
        <div class="gps-bar" :class="gpsBarClass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="gps-icon">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <div class="gps-info">
            <span class="gps-label">{{ gpsLabel }}</span>
            <span class="gps-coords" v-if="gpsCoords">{{ gpsCoords }}</span>
          </div>
          <div class="gps-dot-pulse" v-if="gpsStatus === 'verified'">
            <span class="gps-pulse-ring"></span>
            <span class="gps-pulse-dot"></span>
          </div>
        </div>

        <!-- Clock In / Out button -->
        <button
          class="clock-btn"
          :class="isClockedIn ? 'clock-btn-out' : 'clock-btn-in'"
          :disabled="btnLoading || isCompletedToday"
          @click="toggleAttendance"
        >
          <span v-if="btnLoading" class="btn-spinner"></span>
          <template v-else>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line v-if="!isClockedIn && !isCompletedToday" x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </template>
          <span v-if="btnLoading">{{ isClockedIn ? 'Clocking Out…' : 'Verifying…' }}</span>
          <span v-else-if="isCompletedToday">✓ Completed for Today</span>
          <span v-else-if="isClockedIn">Clock Out</span>
          <span v-else>Clock In</span>
        </button>

        <!-- Done badge -->
        <div v-if="isCompletedToday" class="done-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {{ todaySummary?.status || 'Present' }} · {{ formatHours(todaySummary?.totalHours ?? todaySummary?.workingHours) }}h worked
        </div>

        <!-- Work hours progress -->
        <div class="cc-progress">
          <div class="cc-prog-head">
            <span>Work Hours</span>
            <span>{{ safeFixed(hoursWorked, 1) }}h / 8h</span>
          </div>
          <div class="cc-prog-bar">
            <div class="cc-prog-fill" :style="{ width: Math.min(hoursWorked / 8 * 100, 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Monthly heatmap -->
      <div class="card month-card">
        <div class="card-head">
          <div class="card-title">{{ currentMonthLabel }}</div>
          <div class="month-legend">
            <span class="leg"><span class="ldot present"></span>Present</span>
            <span class="leg"><span class="ldot absent"></span>Absent</span>
            <span class="leg"><span class="ldot late"></span>Late</span>
            <span class="leg"><span class="ldot half"></span>Half Day</span>
          </div>
        </div>
        <div class="heatmap">
          <div class="hm-days">
            <span v-for="d in dayLabels" :key="d" class="hm-dl">{{ d }}</span>
          </div>
          <div class="hm-grid">
            <div
              v-for="(cell, i) in heatmapCells"
              :key="i"
              class="hm-cell"
              :class="[cell.type, cell.isToday ? 'today' : '']"
              :title="cell.title"
            ></div>
          </div>
        </div>
        <div class="month-stats">
          <div class="ms" v-for="m in monthStats" :key="m.label">
            <div class="ms-val" :style="{ color: m.color }">{{ m.val }}</div>
            <div class="ms-lbl">{{ m.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Recent Records Table ────────────────────────────────── -->
    

    <!-- ── Toast ──────────────────────────────────────────────── -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline v-if="toast.type === 'success'" points="20 6 9 17 4 12"/>
          <circle v-else cx="12" cy="12" r="10"/>
          <line v-if="toast.type === 'error'" x1="15" y1="9" x2="9" y2="15"/>
          <line v-if="toast.type === 'error'" x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        {{ toast.message }}
      </div>
    </transition>

  </UserLayout>
</template>

<script>
import UserLayout from '../../components/UserLayout.vue'
import { attendanceAPI } from '@/services/api'

// ─────────────────────────────────────────────────────────────────────────────
// TIMEZONE
// ─────────────────────────────────────────────────────────────────────────────
const TZ = 'Asia/Kolkata'

function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

function toTimeStr(date) {
  return new Date(date).toLocaleTimeString('en-IN', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PUNCH STATE STORAGE
//
// Key: punch_<employeeCode>_<YYYY-MM-DD>
//
// WHY localStorage only (not sessionStorage):
//   - sessionStorage is cleared automatically when the tab closes or on logout
//     (logout does sessionStorage.clear())
//   - localStorage persists but is KEYED per user+day so there's no bleed
//   - On every login, we wipe ALL punch_* keys that don't match current user
//
// This means:
//   User A logs in  → key: punch_EMP001_2026-05-01
//   User A logs out → localStorage.clear() wipes everything
//   User B logs in  → no punch_* keys exist → fresh state → loads from API
// ─────────────────────────────────────────────────────────────────────────────
const PUNCH_PREFIX = 'punch_'

function punchKey(employeeCode) {
  return `${PUNCH_PREFIX}${employeeCode}_${todayIST()}`
}

function loadPunchState(employeeCode) {
  if (!employeeCode) return null
  try {
    const raw = localStorage.getItem(punchKey(employeeCode))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // Validate shape — reject malformed entries
    if (!parsed || !['out', 'in', 'done'].includes(parsed.status)) return null
    return parsed
  } catch {
    return null
  }
}

function savePunchState(employeeCode, state) {
  if (!employeeCode) return
  localStorage.setItem(punchKey(employeeCode), JSON.stringify(state))
}

function clearAllPunchState() {
  // Called on logout — wipes ALL punch keys from localStorage
  Object.keys(localStorage)
    .filter(k => k.startsWith(PUNCH_PREFIX))
    .forEach(k => localStorage.removeItem(k))
}

// Expose clearAllPunchState so the logout function can call it
// Usage in your logout method (BEFORE localStorage.clear()):
//   import { clearAllPunchState } from '@/views/user/UserAttendanceView.vue'
// OR just call localStorage.clear() which already does the same thing.
// We export it for explicit use if needed.
export { clearAllPunchState }

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default {
  name: 'UserAttendanceView',
  components: { UserLayout },

  data() {
    return {
      loading:        false,
      recordsLoading: false,
      btnLoading:     false,

      todaySummary: null,
      records:      [],

      currentTime: '',
      clockTimer:  null,

      // ── Single source of truth: 'out' | 'in' | 'done' ────────
      // Always loaded from API on mount — localStorage is only a
      // fast-load cache to avoid flash of wrong state
      punchState: { status: 'out', checkIn: null, checkOut: null },

      // GPS
      gpsCoords: null,
      gpsLabel:  'Location not fetched',
      gpsStatus: 'idle',

      // Filter
      activeFilter: 'All',
      filters: ['All', 'Present', 'Absent', 'Late', 'Half Day'],

      // Toast
      toast: { show: false, message: '', type: 'success' },
    }
  },

  computed: {
    token() {
      return sessionStorage.getItem('hrms_token') || localStorage.getItem('hrms_token') || ''
    },

    employeeCode() {
      return sessionStorage.getItem('employeeCode') || localStorage.getItem('employeeCode') || ''
    },

    isClockedIn()     { return this.punchState.status === 'in' },
    isCompletedToday(){ return this.punchState.status === 'done' },

    hoursWorked() {
      return Number(this.todaySummary?.totalHours ?? this.todaySummary?.workingHours ?? 0)
    },

    todayFormatted() {
      return new Date().toLocaleDateString('en-IN', {
        timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      })
    },
    currentMonthLabel() {
      return new Date().toLocaleDateString('en-IN', { timeZone: TZ, month: 'long', year: 'numeric' })
    },
    dayLabels() { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] },

    heatmapCells() {
      const istNow      = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
      const year        = istNow.getFullYear()
      const month       = istNow.getMonth()
      const firstDay    = new Date(year, month, 1).getDay()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const todayDate   = istNow.getDate()
      const cells       = []

      for (let i = 0; i < firstDay; i++) cells.push({ type: 'empty', title: '', isToday: false })

      for (let d = 1; d <= daysInMonth; d++) {
        const dateObj   = new Date(year, month, d)
        const isWeekend = [0, 6].includes(dateObj.getDay())
        const isFuture  = d > todayDate
        const isToday   = d === todayDate

        const rec = this.records.find(r => {
          const rd = new Date(r.date)
          return rd.getDate() === d && rd.getMonth() === month && rd.getFullYear() === year
        })

        let type  = 'empty'
        let title = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })

        if (isWeekend)     { type = 'weekend';    title += ' — Weekend' }
        else if (isFuture) { type = 'empty' }
        else if (rec) {
          const s = (rec.status || '').toLowerCase()
          type = s === 'present'   ? 'present'
               : s === 'absent'    ? 'absent'
               : s === 'late'      ? 'late'
               : (s === 'halfday' || s === 'half day') ? 'halfday'
               : s === 'incomplete'? 'incomplete'
               : 'empty'
          title += ` — ${rec.status}`
        } else {
          type  = isToday ? 'incomplete' : 'absent'
          title += isToday ? ' — In Progress' : ' — Absent'
        }
        cells.push({ type, title, isToday })
      }
      return cells
    },

    summaryStats() {
      const r = this.records
      const present = r.filter(x => (x.status||'').toLowerCase() === 'present').length
      const absent  = r.filter(x => (x.status||'').toLowerCase() === 'absent').length
      const late    = r.filter(x => (x.status||'').toLowerCase() === 'late').length
      const half    = r.filter(x => ['halfday','half day'].includes((x.status||'').toLowerCase())).length
      const totalH  = r.reduce((s, x) => s + Number(x.hours ?? x.workingHours ?? 0), 0)
      return [
        { label:'Present Days',  val:present,                         color:'#2d7d32', iconCls:'ic-green',
          icon:'<polyline points="20 6 9 17 4 12"/>' },
        { label:'Absent Days',   val:absent,                          color:'#8a3525', iconCls:'ic-peach',
          icon:'<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' },
        { label:'Late Arrivals', val:late,                            color:'#7a5800', iconCls:'ic-amber',
          icon:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
        { label:'Half Days',     val:half,                            color:'#2a4080', iconCls:'ic-stone',
          icon:'<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z"/>' },
        { label:'Total Hours',   val:this.safeFixed(totalH,1)+'h',   color:'#a8e6b0', iconCls:'ic-forest', featured:true,
          icon:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
      ]
    },

    monthStats() {
      const r = this.records
      const present = r.filter(x => (x.status||'').toLowerCase() === 'present').length
      const absent  = r.filter(x => (x.status||'').toLowerCase() === 'absent').length
      const late    = r.filter(x => (x.status||'').toLowerCase() === 'late').length
      const totalH  = r.reduce((s, x) => s + Number(x.hours ?? x.workingHours ?? 0), 0)
      return [
        { label:'Present',     val:present,                       color:'#2d7d32' },
        { label:'Absent',      val:absent,                        color:'#8a3525' },
        { label:'Late',        val:late,                          color:'#7a5800' },
        { label:'Total Hours', val:this.safeFixed(totalH,1)+'h', color:'#2d6e33' },
      ]
    },

    filteredRecords() {
      const sorted = [...this.records].sort((a, b) => new Date(b.date) - new Date(a.date))
      if (this.activeFilter === 'All') return sorted
      return sorted.filter(r =>
        (r.status||'').toLowerCase().replace(' ','') ===
        this.activeFilter.toLowerCase().replace(' ','')
      )
    },

    gpsBarClass() {
      return {
        'gps-verified': this.gpsStatus === 'verified',
        'gps-loading':  this.gpsStatus === 'loading',
        'gps-denied':   this.gpsStatus === 'denied',
        'gps-error':    this.gpsStatus === 'error',
      }
    },
  },

  created() {
    // ── Fast-load from localStorage cache (avoids UI flash) ───
    // This is ONLY a display hint — API response always wins in mounted()
    const cached = loadPunchState(this.employeeCode)
    if (cached) this.punchState = cached
    // If no cache (fresh login / after logout) → stays 'out' which is correct
  },

  mounted() {
    this.startClock()
    // API is the real source of truth — always load on mount
    this.loadTodaySummary()
    this.loadMonthlyRecords()
  },

  beforeUnmount() {
    clearInterval(this.clockTimer)
  },

  methods: {
    startClock() {
      const tick = () => {
        this.currentTime = new Date().toLocaleTimeString('en-IN', {
          timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        })
      }
      tick()
      this.clockTimer = setInterval(tick, 1000)
    },

    safeFixed(val, digits = 2) {
      const n = Number(val ?? 0)
      return Number.isFinite(n) ? n.toFixed(digits) : '0.0'
    },
    formatHours(val) { return this.safeFixed(val, 1) },

    statusClass(status) {
      const map = { present:'s-present', absent:'s-absent', late:'s-late',
        halfday:'s-halfday', incomplete:'s-incomplete', leave:'s-leave', wfh:'s-wfh' }
      return map[(status||'').toLowerCase().replace(' ','')] || 's-leave'
    },
    hoursClass(hours) {
      const h = Number(hours ?? 0)
      return h >= 7 ? 'good' : h >= 4 ? 'half' : 'zero'
    },
    showToast(message, type = 'success', duration = 3500) {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, duration)
    },

    // ── SET STATE: single mutation point ─────────────────────────
    setPunchState(status, checkIn = null, checkOut = null) {
      this.punchState = { status, checkIn, checkOut }
      savePunchState(this.employeeCode, this.punchState)
    },

    // ── SYNC FROM API ─────────────────────────────────────────────
    // API response is always the ground truth.
    // Called after every loadTodaySummary().
    // If btnLoading=true we skip to avoid overwriting an in-flight punch.
    syncFromSummary(summary) {
      // If a punch is in flight, don't let the old summary overwrite the
      // optimistic state we already set
      if (this.btnLoading) return

      // No summary returned from server = no attendance today at all
      if (!summary) {
        this.setPunchState('out', null, null)
        return
      }

      // Try every field name the backend might use
      const rawIn  = summary.firstCheckIn   || summary.checkInTime   ||
                     summary.check_in_time  || summary.punchIn       ||
                     summary.inTime         || null

      const rawOut = summary.lastCheckOut   || summary.checkOutTime  ||
                     summary.check_out_time || summary.punchOut      ||
                     summary.outTime        || null

      if (!rawIn) {
        // Server has no check-in for this employee today
        this.setPunchState('out', null, null)
        return
      }

      const checkInStr  = toTimeStr(rawIn)
      const checkOutStr = rawOut ? toTimeStr(rawOut) : null

      if (rawOut) {
        this.setPunchState('done', checkInStr, checkOutStr)
      } else {
        this.setPunchState('in', checkInStr, null)
      }
    },

    // ── LOAD TODAY SUMMARY ────────────────────────────────────────
    async loadTodaySummary() {
      this.loading = true
      try {
        const code = this.employeeCode
        if (!code) {
          this.showToast('Employee code missing — please log in again.', 'error')
          this.$router.push('/login')
          return
        }

        const res = await attendanceAPI.getSummary(code, { date: todayIST() })

        // Backend returns { success, summary } OR just the summary object
        this.todaySummary = res.data?.summary || res.data || null

        // ── Sync UI state from server ────────────────────────────
        // This is the authoritative update. After logout + re-login,
        // localStorage is empty so punchState starts as 'out'.
        // syncFromSummary will set it correctly from the DB.
        this.syncFromSummary(this.todaySummary)

      } catch (err) {
        console.error('Summary error:', err)
        if (err.response?.status === 401) {
          this.$router.push('/login')
        } else {
          // On error keep whatever state we have — don't reset to 'out'
          // in case it's a transient network error
          this.showToast('Could not load today\'s attendance.', 'error')
        }
      } finally {
        this.loading = false
      }
    },

    // ── LOAD MONTHLY RECORDS ──────────────────────────────────────
    async loadMonthlyRecords() {
      this.recordsLoading = true
      try {
        const code = this.employeeCode
        if (!code) return

        const now   = new Date()
        const month = (now.getMonth() + 1).toString().padStart(2, '0')
        const year  = now.getFullYear()

        const res = await attendanceAPI.getLogs(code, { month, year })
        this.records = res.data?.dailyStats || res.data?.records || res.data?.data || res.data || []

      } catch (err) {
        console.error('Monthly records error:', err)
        if (err.response?.status === 401) this.$router.push('/login')
        this.records = []
      } finally {
        this.recordsLoading = false
      }
    },

    // ── GPS ───────────────────────────────────────────────────────
    requestLocation() {
      this.gpsStatus = 'loading'
      this.gpsLabel  = 'Fetching location…'
      this.gpsCoords = null
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          this.gpsStatus = 'error'
          this.gpsLabel  = 'Geolocation not supported'
          resolve(null); return
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.gpsCoords = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
            this.gpsLabel  = 'Location verified'
            this.gpsStatus = 'verified'
            resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          },
          () => {
            this.gpsStatus = 'denied'
            this.gpsLabel  = 'Location access denied'
            resolve(null)
          },
          { timeout: 10000, maximumAge: 60000 }
        )
      })
    },

    // ── PUNCH IN ─────────────────────────────────────────────────
    // attendanceAPI.punch → POST /api/attendance/punch-in
    async doPunchIn() {
      this.btnLoading = true
      try {
        const coords = await this.requestLocation()
        const now    = new Date()

        await attendanceAPI.punch({
          employeeCode: this.employeeCode,
          latitude:     coords?.latitude  ?? null,
          longitude:    coords?.longitude ?? null,
        })

        // Optimistic update — server confirmed success
        const timeStr = toTimeStr(now)
        this.setPunchState('in', timeStr, null)
        this.showToast(`Clocked in at ${timeStr}`, 'success')

        // Reload to get lateByMinutes, shift info etc.
        await this.loadTodaySummary()
        await this.loadMonthlyRecords()

      } catch (err) {
        console.error('Punch-in error:', err)
        if (err.response?.status === 401) this.$router.push('/login')
        else this.showToast(err.response?.data?.error || 'Clock-in failed. Please try again.', 'error')
      } finally {
        this.btnLoading = false
      }
    },

    // ── PUNCH OUT ────────────────────────────────────────────────
    // attendanceAPI.punchOut → POST /api/attendance/punch-out
    // Make sure api.js has:
    //   punchOut: (data) => apiClient.post('/attendance/punch-out', data)
    async doPunchOut() {
      this.btnLoading = true
      try {
        const coords = await this.requestLocation()
        const now    = new Date()

        await attendanceAPI.punchOut({
          employeeCode: this.employeeCode,
          latitude:     coords?.latitude  ?? null,
          longitude:    coords?.longitude ?? null,
        })

        // Optimistic update — server confirmed success
        const timeStr = toTimeStr(now)
        this.setPunchState('done', this.punchState.checkIn, timeStr)
        this.showToast(`Clocked out at ${timeStr}`, 'success')

        // Reload to get totalHours, final status etc.
        await this.loadTodaySummary()
        await this.loadMonthlyRecords()

      } catch (err) {
        console.error('Punch-out error:', err)
        if (err.response?.status === 401) this.$router.push('/login')
        else this.showToast(err.response?.data?.error || 'Clock-out failed. Please try again.', 'error')
      } finally {
        this.btnLoading = false
      }
    },

    async toggleAttendance() {
      if      (this.punchState.status === 'out') await this.doPunchIn()
      else if (this.punchState.status === 'in')  await this.doPunchOut()
      // 'done' → button is disabled, never reaches here
    },
  }
}
</script>

<style scoped>
.card { background:#fff; border-radius:18px; padding:24px; border:1px solid #e8ece4; }
.card-eyebrow { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:1.5px; color:#8aaa8a; margin-bottom:4px; }
.card-title { font-family:'DM Serif Display',serif; font-size:17px; color:#1e261f; }
.card-head  { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px; }

.stats-row { display:grid; grid-template-columns:repeat(5,1fr); gap:14px; margin-bottom:20px; }
@media(max-width:900px){ .stats-row{ grid-template-columns:repeat(3,1fr); } }
@media(max-width:580px){ .stats-row{ grid-template-columns:repeat(2,1fr); } }

.stat-card { background:#fff; border:1px solid #e8ece4; border-radius:14px; padding:18px; display:flex; flex-direction:column; align-items:flex-start; gap:8px; }
.stat-featured { background:#1a2e1a !important; border-color:#1a2e1a; }
.stat-featured .stat-val { color:#a8e6b0 !important; }
.stat-featured .stat-lbl { color:rgba(255,255,255,.5) !important; }
.stat-icon { width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.stat-icon svg { width:16px; height:16px; }
.ic-green  { background:rgba(169,233,173,.3); color:#1a2e1a; }
.ic-peach  { background:rgba(255,207,193,.4); color:#8a3525; }
.ic-amber  { background:rgba(240,208,128,.3); color:#7a5800; }
.ic-stone  { background:rgba(117,120,114,.12); color:#8aaa8a; }
.ic-forest { background:rgba(255,255,255,.1); color:#a8e6b0; }
.stat-val { font-family:'DM Serif Display',serif; font-size:26px; line-height:1; }
.stat-lbl { font-size:11px; color:#8aaa8a; }

.att-main { display:grid; grid-template-columns:320px 1fr; gap:20px; margin-bottom:20px; }
@media(max-width:820px){ .att-main{ grid-template-columns:1fr; } }

.clock-card { display:flex; flex-direction:column; gap:16px; }
.cc-head    { display:flex; justify-content:space-between; align-items:flex-start; }
.cc-time    { font-family:'DM Serif Display',serif; font-size:28px; color:#1a2e1a; }

.cc-badge             { font-size:11px; font-weight:600; padding:5px 12px; border-radius:20px; white-space:nowrap; }
.cc-badge.clocked     { background:rgba(169,233,173,.3); color:#2d5c32; }
.cc-badge.not-clocked { background:#f0f0ee; color:#8aaa8a; }

.cc-times { display:flex; align-items:center; background:#f8faf8; border-radius:12px; overflow:hidden; }
.cc-time-row     { flex:1; display:flex; align-items:center; gap:10px; padding:14px 16px; }
.cc-time-row svg { width:15px; height:15px; color:#8aaa8a; flex-shrink:0; }
.cc-tl { font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.8px; color:#8aaa8a; }
.cc-tv { font-size:14px; font-weight:600; color:#1e261f; margin-top:2px; }
.cc-time-divider { width:1px; height:40px; background:#e4e8e0; flex-shrink:0; }

.late-banner { display:flex; align-items:center; gap:7px; padding:10px 14px; background:rgba(240,208,128,.2); border:1px solid rgba(240,208,128,.5); border-radius:10px; font-size:12px; font-weight:600; color:#7a5800; }
.done-badge  { display:flex; align-items:center; gap:7px; padding:10px 14px; background:rgba(169,233,173,.15); border:1px solid rgba(169,233,173,.4); border-radius:10px; font-size:12px; font-weight:600; color:#2d5c32; }

.gps-bar { display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:12px; border:1px solid #e8ece4; background:#f8faf8; transition:background .2s,border-color .2s; }
.gps-bar.gps-verified { background:rgba(169,233,173,.15); border-color:rgba(169,233,173,.5); }
.gps-bar.gps-loading  { background:rgba(240,208,128,.1);  border-color:rgba(240,208,128,.4); }
.gps-bar.gps-denied,.gps-bar.gps-error { background:rgba(255,207,193,.15); border-color:rgba(255,150,130,.4); }
.gps-icon { width:15px; height:15px; flex-shrink:0; color:#8aaa8a; }
.gps-bar.gps-verified .gps-icon { color:#2d6e33; }
.gps-bar.gps-loading  .gps-icon { color:#7a5800; }
.gps-bar.gps-denied .gps-icon,.gps-bar.gps-error .gps-icon { color:#8a3525; }
.gps-info   { flex:1; display:flex; flex-direction:column; gap:1px; }
.gps-label  { font-size:11px; font-weight:500; color:#8aaa8a; }
.gps-coords { font-size:10px; color:#7a9a7e; }
.gps-bar.gps-verified .gps-label { color:#2d6e33; }
.gps-bar.gps-denied .gps-label,.gps-bar.gps-error .gps-label { color:#8a3525; }
.gps-dot-pulse { position:relative; width:14px; height:14px; flex-shrink:0; }
.gps-pulse-dot { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:7px; height:7px; border-radius:50%; background:#3a7a42; }
.gps-pulse-ring { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:14px; height:14px; border-radius:50%; background:rgba(58,122,66,.3); animation:gps-pulse 1.6s ease-out infinite; }
@keyframes gps-pulse { 0%{ transform:translate(-50%,-50%) scale(.6); opacity:1; } 100%{ transform:translate(-50%,-50%) scale(1.8); opacity:0; } }

.clock-btn { width:100%; padding:13px 0; border:none; border-radius:12px; font-size:14px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .18s; display:flex; align-items:center; justify-content:center; gap:8px; }
.clock-btn:active   { transform:scale(.98); }
.clock-btn:disabled { opacity:.6; cursor:not-allowed; }
.clock-btn-in { background:#1a2e1a; color:#fff; }
.clock-btn-in:hover:not(:disabled) { background:#2e7d32; }
.clock-btn-out { background:rgba(255,207,193,.25); color:#7a3325; border:1px solid rgba(220,140,120,.5); }
.clock-btn-out:hover:not(:disabled) { background:rgba(255,207,193,.45); }
.btn-spinner { display:inline-block; width:14px; height:14px; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:spin .65s linear infinite; }
.clock-btn-out .btn-spinner { border-color:rgba(122,51,37,.3); border-top-color:#7a3325; }
@keyframes spin { to{ transform:rotate(360deg); } }

.cc-progress { margin-top:4px; }
.cc-prog-head { display:flex; justify-content:space-between; font-size:12px; color:#8aaa8a; margin-bottom:8px; font-weight:500; }
.cc-prog-bar  { height:6px; background:#eef0ec; border-radius:6px; overflow:hidden; }
.cc-prog-fill { height:100%; background:linear-gradient(90deg,#86d98b,#2e7d32); border-radius:6px; transition:width .4s ease; }

.month-legend { display:flex; gap:14px; flex-wrap:wrap; }
.leg  { display:flex; align-items:center; gap:5px; font-size:11px; color:#8aaa8a; }
.ldot { width:10px; height:10px; border-radius:3px; }
.ldot.present{ background:#86d98b; } .ldot.absent{ background:#ffcfc1; } .ldot.late{ background:#f0d080; } .ldot.half{ background:#b0c8ff; }
.hm-days { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-bottom:4px; }
.hm-dl   { font-size:10px; font-weight:600; color:#b0b5ae; text-align:center; text-transform:uppercase; letter-spacing:.5px; }
.hm-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
.hm-cell { height:28px; border-radius:5px; background:#f0f0ee; cursor:pointer; transition:transform .15s; }
.hm-cell:hover      { transform:scale(1.1); }
.hm-cell.present    { background:#86d98b; } .hm-cell.absent   { background:#ffcfc1; }
.hm-cell.late       { background:#f0d080; } .hm-cell.halfday  { background:#b0c8ff; }
.hm-cell.incomplete { background:#e0c898; } .hm-cell.weekend  { background:#f5f5f2; }
.hm-cell.empty      { background:#f0f0ee; }
.hm-cell.today      { outline:2px solid #2e7d32; outline-offset:1px; }
.month-stats { display:flex; border-top:1px solid #eef0ec; padding-top:16px; margin-top:16px; }
.ms       { flex:1; text-align:center; }
.ms+.ms   { border-left:1px solid #eef0ec; }
.ms-val   { font-family:'DM Serif Display',serif; font-size:20px; margin-bottom:3px; }
.ms-lbl   { font-size:10.5px; color:#8aaa8a; }

.records-card { margin-top:0; }
.rec-filters { display:flex; gap:4px; flex-wrap:wrap; }
.rfbtn { padding:5px 14px; border-radius:20px; border:1px solid #e4e8e0; background:transparent; font-size:12px; font-weight:500; color:#8aaa8a; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .18s; }
.rfbtn:hover  { background:#f0f5f0; color:#2e7d32; border-color:#c4d8c6; }
.rfbtn.active { background:#1a2e1a; color:#fff; border-color:#1a2e1a; }
.loading-row { display:flex; align-items:center; gap:10px; padding:32px; color:#8aaa8a; font-size:13px; }
.spinner { display:inline-block; width:16px; height:16px; border:2px solid #e8ece4; border-top-color:#2e7d32; border-radius:50%; animation:spin .65s linear infinite; }
.rec-table-wrap { overflow-x:auto; margin-top:16px; }
.rec-table      { width:100%; border-collapse:collapse; }
.rec-table thead th { padding:10px 16px; text-align:left; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.6px; color:#8aaa8a; background:#f8faf8; border-bottom:1px solid #eef0ec; }
.rec-table tbody tr { border-bottom:1px solid #eef0ec; transition:background .15s; }
.rec-table tbody tr:last-child { border-bottom:none; }
.rec-table tbody tr:hover { background:#f8faf8; }
.rec-table td { padding:12px 16px; }
.rt-date    { display:flex; flex-direction:column; }
.rt-day     { font-size:12px; font-weight:700; color:#1e261f; }
.rt-datelbl { font-size:11px; color:#8aaa8a; }
.rt-time      { font-size:13px; font-weight:500; color:#4a5a4b; }
.rt-time.late { color:#b07020; }
.late-chip { display:inline-block; font-size:10px; font-weight:700; background:rgba(240,208,128,.4); color:#7a5800; padding:1px 6px; border-radius:20px; margin-left:5px; }
.rt-hours { font-size:12px; font-weight:700; padding:2px 9px; border-radius:20px; }
.rt-hours.good { background:rgba(169,233,173,.3); color:#2d5c32; }
.rt-hours.half { background:rgba(240,208,128,.3); color:#8a6020; }
.rt-hours.zero { background:#f0f0ee; color:#8aaa8a; }
.rt-status { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
.s-present    { background:rgba(169,233,173,.3);  color:#2d5c32; }
.s-absent     { background:rgba(255,207,193,.4);  color:#8a3525; }
.s-late       { background:rgba(240,208,128,.3);  color:#8a6020; }
.s-halfday    { background:rgba(176,200,255,.35); color:#2a4080; }
.s-incomplete { background:rgba(224,200,152,.3);  color:#7a6020; }
.s-leave      { background:#f0f0ee; color:#8aaa8a; }
.s-wfh        { background:rgba(169,233,173,.15); color:#2d6e33; }
.rt-note   { font-size:12px; color:#b0b5ae; }
.empty-row { text-align:center; font-size:13px; color:#8aaa8a; padding:32px 0; }

.toast { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; align-items:center; gap:10px; padding:13px 20px; border-radius:12px; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; box-shadow:0 8px 32px rgba(0,0,0,.14); max-width:380px; }
.toast.success { background:#1a2e1a; color:#a8e6b0; }
.toast.error   { background:#3a1212; color:#ffcfc1; }
.toast.warning { background:#3a2e10; color:#f0d080; }
.toast-enter-active { animation:toastIn .25s ease; }
.toast-leave-active { animation:toastIn .2s ease reverse; }
@keyframes toastIn { from{ opacity:0; transform:translateY(12px); } to{ opacity:1; transform:translateY(0); } }
</style>