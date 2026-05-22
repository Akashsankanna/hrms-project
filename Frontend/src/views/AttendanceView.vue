<template>
  <AdminLayout page-title="Attendance" add-label="" @add="showMarkModal = true">

  <div class="sticky-top-section">
    <!-- ───────────────── FILTER BAR ───────────────── -->
    <div class="filter-bar">
      <div class="filter-tabs">
        <button
          v-for="t in tabs" :key="t"
          class="ftab" :class="{ active: activeTab === t }"
          @click="onTabChange(t)"
        >{{ t }}</button>
      </div>
      <div class="filter-right">
        <input type="date" class="fdate" v-model="selectedDate" @change="onDateChange">
        <select class="fselect" v-model="deptFilter" @change="onFilterChange">
          <option value="">All Departments</option>
          <option v-for="d in departments" :key="d">{{ d }}</option>
        </select>
        <button class="export-btn" @click="exportCSV">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export
        </button>
      </div>
    </div>

    <!-- ───────────────── TOAST ───────────────── -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        {{ toast.message }}
      </div>
    </transition>

    <!-- ───────────────── KPI STRIP ───────────────── -->
    <div class="kpi-strip">
      <div class="kpi" v-for="k in kpiCards" :key="k.label">
        <div class="kpi-ico" :style="{ background: k.bg }">
          <svg viewBox="0 0 24 24" fill="none" :stroke="k.stroke" stroke-width="1.8" v-html="k.icon"></svg>
        </div>
        <div class="kpi-right">
          <div class="kpi-val">
            <span v-if="loading" class="skeleton-val"></span>
            <span v-else>{{ k.value }}</span>
          </div>
          <div class="kpi-lbl">{{ k.label }}</div>
        </div>
        <div class="kpi-trend" :class="k.trendCls">{{ k.trend }}</div>
      </div>
    </div>

</div>
    <!-- ───────────────── MAIN GRID ───────────────── -->
    <div class="att-grid">

      <!-- ATTENDANCE TABLE -->
      <div class="card">
        <div class="card-hd">
          <div>
            <div class="card-title">Daily Attendance — {{ formattedDate }}</div>
            <div class="card-sub">
              <template v-if="loading">Loading records…</template>
              <template v-else>
                {{ pagination.total }} records · {{ kpis.present }} present · {{ kpis.absent }} absent
              </template>
            </div>
          </div>
        
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading" class="skeleton-table">
          <div class="sk-row" v-for="i in 6" :key="i">
            <div class="sk-avatar"></div>
            <div class="sk-lines">
              <div class="sk-line sk-name"></div>
              <div class="sk-line sk-id"></div>
            </div>
            <div class="sk-line sk-dept"></div>
            <div class="sk-line sk-time"></div>
            <div class="sk-line sk-time"></div>
            <div class="sk-line sk-badge"></div>
            <div class="sk-line sk-status"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!loading && filteredRecords.length === 0" class="empty-state">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-ico">
            <rect x="8" y="16" width="48" height="40" rx="4"/>
            <path d="M8 24h48"/><path d="M24 8v16"/><path d="M40 8v16"/>
            <path d="M22 38h20"/><path d="M22 44h12"/>
          </svg>
          <div class="empty-title">No attendance records found</div>
          <div class="empty-sub">Try adjusting your filters or date selection.</div>
        </div>

        <!-- Table -->
               <div v-else class="table-scroll">

        <table  class="att-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in filteredRecords" :key="rec.id">
              <td>
                <div class="emp-cell">
                  <div class="emp-av" :style="{ background: rec.color }">{{ rec.initials }}</div>
                  <div>
                    <div class="emp-name">{{ rec.name }}</div>
                    <div class="emp-id">{{ rec.empCode }}</div>
                  </div>
                </div>
              </td>
              <td><span class="dept-tag">{{ rec.department }}</span></td>
              <td class="tc time" :class="{ late: rec.late }">
                {{ rec.checkIn || '—' }}
                <span v-if="rec.late && rec.lateByMinutes" class="late-pill">+{{ rec.lateByMinutes }}m</span>
              </td>
              <td class="tc time">{{ rec.checkOut || '—' }}</td>
              <td class="tc">
                <span v-if="rec.hours != null" class="hours-badge" :class="hoursClass(rec.hours)">
                  {{ rec.hours }}h
                </span>
                <span v-else>—</span>
              </td>
              <td><span class="status-chip" :class="statusClass(rec.status)">{{ rec.status }}</span></td>
              <td class="tc note">{{ rec.note || '—' }}</td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Pagination -->
        <div class="table-foot" v-if="!loading && filteredRecords.length > 0">
          <span class="tf-info">
            Showing {{ paginationStart }}–{{ paginationEnd }} of {{ pagination.total }} records
          </span>
          <div class="pagination">
            <button class="pg" :disabled="pagination.page <= 1" @click="changePage(pagination.page - 1)">‹</button>
            <button
              v-for="p in visiblePages" :key="p"
              class="pg" :class="{ active: p === pagination.page }"
              @click="changePage(p)"
            >{{ p }}</button>
            <button class="pg" :disabled="pagination.page >= totalPages" @click="changePage(pagination.page + 1)">›</button>
          </div>
        </div>
      </div>

      <!-- ───── RIGHT SIDEBAR ───── -->
      <div class="right-col">

        <!-- Donut Summary -->
        <div class="card summary-card">
          <div class="card-hd" style="padding-bottom:16px">
            <div class="card-title">Today's Summary</div>
          </div>
          <div class="donut-wrap">
            <div class="donut-container" ref="donutContainer">
              <canvas ref="donutCanvas" width="130" height="130"></canvas>
              <div class="donut-center">
                <span class="donut-num">{{ kpis.present }}</span>
                <span class="donut-of">of {{ kpis.total }}</span>
              </div>
            </div>
            <div class="donut-legend">
              <div class="dl">
                <span class="dl-dot" style="background:var(--mint)"></span>
                <span class="dl-lbl">Present</span>
                <strong>{{ kpis.present }}</strong>
              </div>
              <div class="dl">
                <span class="dl-dot" style="background:var(--peach)"></span>
                <span class="dl-lbl">Absent</span>
                <strong>{{ kpis.absent }}</strong>
              </div>
              <div class="dl">
                <span class="dl-dot" style="background:var(--stone-dim)"></span>
                <span class="dl-lbl">On Leave</span>
                <strong>{{ kpis.onLeave }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Late Arrivals -->
        <div class="card">
          <div class="card-hd">
            <div class="card-title">Late Arrivals</div>
            <span class="count-badge">{{ lateArrivals.length }}</span>
          </div>
          <div class="mini-list" v-if="lateArrivals.length">
            <div class="mini-row" v-for="l in lateArrivals" :key="l.empCode">
              <div class="mini-av" :style="{ background: l.color }">{{ l.initials }}</div>
              <div class="mini-info">
                <div class="mini-name">{{ l.name }}</div>
                <div class="mini-sub">{{ l.department }}</div>
              </div>
              <div class="mini-time late">{{ l.checkIn }}</div>
            </div>
          </div>
          <div v-else class="mini-empty">No late arrivals today 🎉</div>
        </div>

      </div>
    </div>

    <!-- ───────────────── MONTHLY OVERVIEW ───────────────── -->
    

  </AdminLayout>
</template>

<script>
import AdminLayout from '../components/AdminLayout.vue'
import {
  fetchDailySummaries,
  fetchMonthlyOverview,
  markAttendance,
  computeKPIs,
 fetchEmployeeList,
} from '../services/attendance.service.js'

// ── Debounce utility ─────────────────────────────────────────────────────────
function debounce(fn, ms = 350) {
  let timer
  return function (...args) {
    const ctx = this
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(ctx, args), ms)
  }
}

export default {
  name: 'AttendanceView',
  components: { AdminLayout },

  data() {
    const today = new Date().toISOString().split('T')[0]
    return {
      // ── UI state ──────────────────────────────────────────────────────────
      activeTab:     'All',
      viewMode:      'table',
      selectedDate:  today,
      deptFilter:    '',
      showMarkModal: false,
      loading:       false,
      saving:        false,

      toast: { show: false, message: '', type: 'success' },

      tabs:        ['All', 'Present', 'Absent', 'Late', 'On Leave', 'Half Day'],
      departments: [],   // populated from records

      // ── Data ─────────────────────────────────────────────────────────────
      records:     [],   // normalised attendance records for selected date
      employees:   [],   // for mark-modal dropdown
      monthlyData: [],   // [{ pct: number }] × days-in-month

      // ── Computed KPIs (updated after fetch) ───────────────────────────────
      kpis: { total: 0, present: 0, absent: 0, late: 0, onLeave: 0, avgHours: '—' },

      // ── Pagination ───────────────────────────────────────────────────────
      pagination: { page: 1, limit: 5, total: 0 },

      // ── Mark modal ───────────────────────────────────────────────────────
      mark: {
        employeeCode: '',


        date:         today,
        punchType:    'CHECK_IN',
        time:         new Date().toTimeString().slice(0, 5),
        source:       'WEB',
        remarks:      '',
      },

      // ── KPI card config (values filled dynamically) ───────────────────────
      kpiCards: [
        {
          label: 'Present Today', key: 'present', trend: '', trendCls: 't-up',
          bg: 'var(--mint-ghost)', stroke: 'var(--forest-deep)',
          icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12a9 9 0 11-9-9"/>',
          value: '—',
        },
        {
          label: 'Absent', key: 'absent', trend: '', trendCls: 't-down',
          bg: 'var(--peach-dim)', stroke: '#a03020',
          icon: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
          value: '—',
        },
        {
          label: 'Late Arrivals', key: 'late', trend: '', trendCls: 't-warn',
          bg: '#fef9ec', stroke: '#9c6f0c',
          icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
          value: '—',
        },
        
        {
          label: 'Avg. Hours/Day', key: 'avgHours', trend: '', trendCls: 't-up',
          bg: 'var(--stone-dim)', stroke: 'var(--stone)',
          icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
          value: '—',
        },
      ],
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  computed: {
    formattedDate() {
      const d = new Date(this.selectedDate + 'T00:00:00')
      return d.toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    },

    currentMonthLabel() {
      const d = new Date()
      return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    },

    /** Client-side tab/dept filter on top of server-paginated records */
    filteredRecords() {
      return this.records.filter(r => {
        // Tab filter
        if (this.activeTab === 'Late') return r.late
        if (this.activeTab !== 'All' && r.status !== this.activeTab) return false
        // Dept filter
        if (this.deptFilter && r.department !== this.deptFilter) return false
        return true
      })
    },

    lateArrivals() {
      return this.records.filter(r => r.late)
    },

    absentList() {
      return this.records
        .filter(r => r.status === 'Absent' || r.status === 'On Leave')
        .map(r => ({
          ...r,
          reason: r.status,
          cls:    r.status === 'On Leave' ? 'r-leave' : 'r-warn',
        }))
    },

    totalPages() {
      return Math.ceil(this.pagination.total / this.pagination.limit)
    },

    paginationStart() {
      return (this.pagination.page - 1) * this.pagination.limit + 1
    },
    paginationEnd() {
      return Math.min(this.pagination.page * this.pagination.limit, this.pagination.total)
    },

    visiblePages() {
      const pages = []
      const tp    = this.totalPages
      const cp    = this.pagination.page
      for (let i = Math.max(1, cp - 2); i <= Math.min(tp, cp + 2); i++) pages.push(i)
      return pages
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  watch: {
    kpis: {
      deep: true,
      handler() {
        this.syncKpiCards()
        this.$nextTick(() => this.drawDonut())
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  async mounted() {
    // Load employees for mark modal from localStorage (or swap to API call)
    try {
  this.employees = await fetchEmployeeList()
} catch (e) {
  console.error('Failed to load employees:', e)
  this.employees = []
}
    // Initial data load
    await this.loadAttendance()
    await this.loadMonthlyOverview()
  },

  // ─────────────────────────────────────────────────────────────────────────
  methods: {

    // ── Data fetching ──────────────────────────────────────────────────────

    async loadAttendance() {
      this.loading = true
      try {
        const { records, total } = await fetchDailySummaries({
          date:       this.selectedDate,
          department: this.deptFilter,
          page:       this.pagination.page,
          limit:      this.pagination.limit,
        })

        this.records          = records
        this.pagination.total = total

        // Derive department list from returned records
        const depts = [...new Set(records.map(r => r.department).filter(Boolean))]
        if (depts.length > this.departments.length) this.departments = depts

        // Compute KPIs from the full unfiltered day set
        this.kpis = computeKPIs(records)

      } catch (err) {
        console.error('[Attendance] loadAttendance:', err)
        this.showToast('Failed to load attendance data. Please try again.', 'error')
      } finally {
        this.loading = false
      }
    },

    async loadMonthlyOverview() {
      const now  = new Date()
      const data = await fetchMonthlyOverview(now.getFullYear(), now.getMonth() + 1)

      if (data.length) {
        this.monthlyData = data
      } else {
        // Placeholder bars when API doesn't have a monthly endpoint yet
        this.monthlyData = Array.from({ length: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() }, () => ({
          pct: Math.floor(Math.random() * 25) + 70,
        }))
      }
    },

    // ── Filter handlers ────────────────────────────────────────────────────

    onTabChange(tab) {
      this.activeTab      = tab
      this.pagination.page = 1
      // 'Late' is client-side only; other tabs can be server-side
      if (tab !== 'Late') this.loadAttendance()
    },

    onDateChange: debounce(function () {
      this.pagination.page = 1
      this.loadAttendance()
    }, 300),

    onFilterChange: debounce(function () {
      this.pagination.page = 1
      this.loadAttendance()
    }, 300),

    changePage(p) {
      if (p < 1 || p > this.totalPages) return
      this.pagination.page = p
      this.loadAttendance()
    },

    // ── Save attendance (Mark modal) ───────────────────────────────────────

    async saveAttendance() {
      if (!this.mark.employeeCode) {
        this.showToast('Please select an employee.', 'error')
        return
      }

      this.saving = true
      try {
        const date = this.mark.date || this.selectedDate
        const punchTime = this.mark.time
          ? new Date(`${date}T${this.mark.time}:00`).toISOString()
          : new Date().toISOString()

        await markAttendance({
          employeeCode: this.mark.employeeCode,
          punchType:    this.mark.punchType,
          date,
          source:       this.mark.source,
          remarks:      this.mark.remarks,
          punchTime,
        })

        this.showToast('Attendance marked successfully.', 'success')
        this.showMarkModal = false
        this.resetMark()
        await this.loadAttendance()

      } catch (err) {
        console.error('[Attendance] saveAttendance:', err)
        const msg = err?.response?.data?.error || 'Failed to save attendance.'
        this.showToast(msg, 'error')
      } finally {
        this.saving = false
      }
    },

    resetMark() {
      this.mark = {
        employeeCode: '',
        date:         this.selectedDate,
        punchType:    'CHECK_IN',
        time:        new Date().toTimeString().slice(0, 5),
        source:       'WEB',
        remarks:      '',
      }
    },

    // ── CSV Export ─────────────────────────────────────────────────────────

    exportCSV() {
      const header = ['Employee', 'Code', 'Department', 'Check In', 'Check Out', 'Hours', 'Status', 'Late', 'Note']
      const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`
      const rows = this.filteredRecords.map(r => [
          escape(r.name), escape(r.empCode), escape(r.department),
          escape(r.checkIn || ''), escape(r.checkOut || ''),
          escape(r.hours != null ? r.hours : ''),
          escape(r.status),
          escape(r.late ? 'Yes' : 'No'),
          escape(r.note || ''),
      ])
const csv = [header.map(escape), ...rows].map(r => r.join(',')).join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `attendance-${this.selectedDate}.csv`
      a.click()
      URL.revokeObjectURL(url)
    },

    // ── Toast ──────────────────────────────────────────────────────────────

    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    },

    // ── KPI card sync ──────────────────────────────────────────────────────

    syncKpiCards() {
      this.kpiCards.forEach(card => {
        card.value = this.kpis[card.key] ?? '—'
      })
    },

    // ── Donut chart (vanilla canvas — no extra lib needed) ─────────────────

    drawDonut() {
      const canvas = this.$refs.donutCanvas
      if (!canvas) return
      const ctx    = canvas.getContext('2d')
      const cx     = 65, cy = 65, r = 48, lw = 14

      const vals  = [this.kpis.present, this.kpis.absent, this.kpis.onLeave]
      const total = vals.reduce((s, v) => s + v, 0) || 1
      const colors = [
        getComputedStyle(document.documentElement).getPropertyValue('--mint').trim()  || '#4caf50',
        getComputedStyle(document.documentElement).getPropertyValue('--peach').trim() || '#f08070',
        '#c8bfb0',
      ]

      ctx.clearRect(0, 0, 130, 130)

      // Track (background ring)
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = '#e8e3dd'
      ctx.lineWidth   = lw
      ctx.stroke()

      // Segments
      let start = -Math.PI / 2
      vals.forEach((v, i) => {
        if (v === 0) return
        const sweep = (v / total) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(cx, cy, r, start, start + sweep)
        ctx.strokeStyle  = colors[i]
        ctx.lineWidth    = lw
        ctx.lineCap      = 'round'
        ctx.stroke()
        start += sweep
      })
    },

    // ── Style helpers ──────────────────────────────────────────────────────

    statusClass(s) {
      return {
        'Present':  'sc-present',
        'Absent':   'sc-absent',
        'Late':     'sc-late',
        'On Leave': 'sc-leave',
        'Half Day': 'sc-half',
        'WFH':      'sc-wfh',
        'Incomplete':'sc-half',
      }[s] || ''
    },

    hoursClass(h) {
      return h >= 8 ? 'h-good' : h >= 4 ? 'h-half' : 'h-low'
    },

    barColor(pct) {
      if (pct >= 90) return 'var(--mint)'
      if (pct >= 75) return 'var(--forest)'
      return 'var(--peach)'
    },
  },
}
</script>

<style scoped>
/* ── Existing styles preserved ── */
.filter-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; flex-wrap:wrap; gap:12px; }
.filter-tabs { display:flex; gap:4px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-sm); padding:4px; }
.ftab { padding:6px 14px; border-radius:var(--r-xs); border:none; background:transparent; font-size:13px; font-weight:500; color:var(--text-3); cursor:pointer; transition:all .18s; }
.ftab.active { background:var(--forest-ink); color:#fff; font-weight:600; }
.filter-right { display:flex; align-items:center; gap:10px; }
.fdate,.fselect { border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); padding:8px 12px; font-size:13px; font-family:inherit; color:var(--text-1); outline:none; cursor:pointer; }
.export-btn { display:flex; align-items:center; gap:7px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-sm); padding:8px 14px; font-size:13px; font-weight:500; color:var(--text-2); cursor:pointer; transition:all .18s; }
.export-btn:hover { background:var(--stone-ghost); }
.export-btn svg { width:14px; height:14px; }

/* KPI */
.kpi-strip { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; margin-bottom:20px; }
.kpi { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-md); padding:16px 18px; display:flex; align-items:center; gap:12px; box-shadow:var(--shadow-xs); }
.kpi-ico { width:38px; height:38px; border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.kpi-ico svg { width:17px; height:17px; }
.kpi-right { flex:1; }
.kpi-val { font-family:'Lora',serif; font-size:22px; font-weight:600; color:var(--text-1); line-height:1; }
.kpi-lbl { font-size:11px; color:var(--text-3); margin-top:2px; }
.kpi-trend { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:20px; white-space:nowrap; }
.t-up   { background:var(--mint-ghost); color:var(--forest-deep); }
.t-down { background:var(--peach-dim); color:#a03020; }
.t-warn { background:#fef9ec; color:#9c6f0c; }
.t-neu  { background:var(--stone-dim); color:var(--stone); }

/* Skeleton KPI */
.skeleton-val { display:inline-block; width:40px; height:20px; background:var(--stone-dim); border-radius:4px; animation:pulse 1.4s ease infinite; }

/* Grid */
.att-grid { display:grid; grid-template-columns:1fr 280px; gap:18px; margin-bottom:18px; }
.card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); box-shadow:var(--shadow-xs); overflow:hidden; }
.card-hd { padding:20px 22px 14px; display:flex; align-items:flex-start; justify-content:space-between; }
.card-title { font-family:'Lora',serif; font-size:15px; font-weight:600; color:var(--text-1); }
.card-sub   { font-size:11.5px; color:var(--text-3); margin-top:2px; }
.card-link  { font-size:12px; font-weight:600; color:var(--forest); background:none; border:none; cursor:pointer; }
.hd-actions { display:flex; gap:6px; }
.hd-btn { width:30px; height:30px; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-xs); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .18s; }
.hd-btn svg { width:14px; height:14px; color:var(--text-3); }
.hd-btn.active { background:var(--forest-ink); border-color:var(--forest-ink); }
.hd-btn.active svg { color:#fff; }

/* Skeleton table */
.skeleton-table { padding:12px 16px; display:flex; flex-direction:column; gap:12px; }
.sk-row { display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:1px solid var(--border); }
.sk-avatar { width:32px; height:32px; border-radius:50%; background:var(--stone-dim); flex-shrink:0; animation:pulse 1.4s ease infinite; }
.sk-lines { display:flex; flex-direction:column; gap:4px; flex:1.5; }
.sk-line { background:var(--stone-dim); border-radius:4px; height:10px; animation:pulse 1.4s ease infinite; }
.sk-name  { width:80%; }
.sk-id    { width:40%; }
.sk-dept  { flex:1; }
.sk-time  { flex:0.8; }
.sk-badge { flex:0.6; }
.sk-status{ flex:0.7; }

@keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:.45 } }

/* Empty state */
.empty-state { display:flex; flex-direction:column; align-items:center; padding:52px 24px; color:var(--text-3); }
.empty-ico { width:56px; height:56px; margin-bottom:14px; opacity:.4; }
.empty-title { font-size:14px; font-weight:600; color:var(--text-2); margin-bottom:4px; }
.empty-sub   { font-size:12.5px; }

.table-scroll::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.table-scroll::-webkit-scrollbar-thumb {
  background: #cfe3cf;
  border-radius: 20px;
}

.table-scroll::-webkit-scrollbar-track {
  background: transparent;
}
/* Table */
.att-table { width:100%; border-collapse:collapse; }
.att-table thead th {z-index:20;position:sticky; padding:10px 16px; background:var(--stone-ghost); font-size:11px; font-weight:700; color:var(--text-3); text-align:left; letter-spacing:.5px; text-transform:uppercase; border-bottom:1px solid var(--border); }
.att-table tbody tr { border-bottom:1px solid var(--border); transition:background .15s; }
.att-table tbody tr:last-child { border-bottom:none; }
.att-table tbody tr:hover { background:var(--stone-ghost); }
.att-table td { padding:12px 16px; }
.emp-cell { display:flex; align-items:center; gap:10px; }
.emp-av { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
.emp-name { font-size:13px; font-weight:600; color:var(--text-1); }
.emp-id   { font-size:10.5px; color:var(--text-3); }
.dept-tag { font-size:11px; font-weight:500; color:var(--text-2); background:var(--stone-ghost); padding:2px 8px; border-radius:20px; }
.tc { font-size:13px; color:var(--text-2); }
.time { font-weight:600; }
.time.late { color:#9c6f0c; }
.note { color:var(--text-3); font-size:12px; }
.late-pill { font-size:9.5px; font-weight:700; background:#fef3cd; color:#9c6f0c; padding:1px 6px; border-radius:20px; margin-left:4px; vertical-align:middle; }

.hours-badge { font-size:11.5px; font-weight:700; padding:2px 9px; border-radius:20px; }
.h-good { background:var(--mint-ghost); color:var(--forest-deep); }
.h-half { background:#fef9ec; color:#9c6f0c; }
.h-low  { background:var(--stone-dim); color:var(--stone); }

.status-chip { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
.sc-present { background:var(--mint-ghost); color:var(--forest-deep); }
.sc-absent  { background:var(--peach-dim); color:#a03020; }
.sc-late    { background:#fef9ec; color:#9c6f0c; }
.sc-leave   { background:rgba(101,125,101,.1); color:var(--forest); }
.sc-half    { background:var(--stone-dim); color:var(--stone); }
.sc-wfh     { background:rgba(100,140,200,.12); color:#3a5fa0; }

/* Pagination */
.table-foot { display:flex; align-items:center; justify-content:space-between; padding:12px 18px; border-top:1px solid var(--border); }
.tf-info { font-size:12px; color:var(--text-3); }
.pagination { display:flex; gap:4px; }
.pg { width:28px; height:28px; border-radius:var(--r-xs); border:1px solid var(--border); background:var(--bg-card); font-size:12.5px; font-weight:500; color:var(--text-2); cursor:pointer; transition:all .15s; }
.pg:disabled { opacity:.4; cursor:not-allowed; }
.pg.active { background:var(--forest-ink); color:#fff; border-color:var(--forest-ink); }

/* Right col */
.right-col { display:flex; flex-direction:column; gap:14px; }
.count-badge { font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; background:var(--mint-ghost); color:var(--forest-deep); }
.count-badge.warn { background:var(--peach-dim); color:#a03020; }

/* Donut */
.summary-card .card-hd { padding-bottom:8px; }
.donut-wrap { display:flex; flex-direction:column; align-items:center; padding:0 22px 20px; }
.donut-container { position:relative; width:130px; height:130px; margin-bottom:16px; }
.donut-container canvas { display:block; }
.donut-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; }
.donut-num { font-family:'Lora',serif; font-size:22px; font-weight:700; color:var(--text-1); line-height:1; }
.donut-of  { font-size:10px; color:var(--text-3); margin-top:1px; }
.donut-legend { width:100%; display:flex; flex-direction:column; gap:8px; }
.dl { display:flex; align-items:center; gap:8px; font-size:12.5px; }
.dl-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.dl-lbl { flex:1; color:var(--text-2); }
.dl strong { color:var(--text-1); font-weight:700; }

/* Mini list */
.mini-list { padding:0 22px 16px; display:flex; flex-direction:column; }
.mini-row { display:flex; align-items:center; gap:10px; padding:9px 0; border-bottom:1px solid var(--border); }
.mini-row:last-child { border-bottom:none; }
.mini-av { width:30px; height:30px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#fff; flex-shrink:0; }
.mini-name { font-size:12.5px; font-weight:600; color:var(--text-1); }
.mini-sub  { font-size:11px; color:var(--text-3); }
.mini-time { font-size:12px; font-weight:600; }
.mini-time.late { color:#c05020; }
.mini-badge { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:20px; }
.mini-empty { padding:16px 22px; font-size:12.5px; color:var(--text-3); text-align:center; }
.r-warn  { background:var(--peach-dim); color:#a03020; }
.r-leave { background:var(--stone-dim); color:var(--stone); }

/* Monthly */
.monthly-card { margin-top:0; }
.monthly-chart { display:flex; align-items:flex-end; gap:4px; height:100px; padding:14px 22px 0; }
.mc-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; }
.mc-bar-wrap { flex:1; display:flex; align-items:flex-end; width:100%; }
.mc-bar { width:100%; border-radius:3px 3px 0 0; min-height:3px; transition:height .4s ease; cursor:pointer; }
.mc-bar:hover { opacity:.8; }
.mc-lbl { font-size:9px; color:var(--text-3); }
.monthly-legend { display:flex; gap:20px; padding:10px 22px 18px; border-top:1px solid var(--border); margin-top:12px; }
.ml-item { display:flex; align-items:center; gap:7px; font-size:12px; color:var(--text-3); }
.ml-dot { width:10px; height:10px; border-radius:50%; }

/* Modal */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:500; display:flex; align-items:center; justify-content:center; }
.modal { background:var(--bg-card); border-radius:var(--r-lg); width:500px; max-width:95vw; }
.modal-hd { display:flex; align-items:center; justify-content:space-between; padding:22px 24px 0; }
.modal-title { font-family:'Lora',serif; font-size:18px; font-weight:600; color:var(--text-1); }
.modal-close { background:none; border:none; font-size:16px; color:var(--text-3); cursor:pointer; width:30px; height:30px; border-radius:50%; }
.modal-close:hover { background:var(--stone-ghost); }
.modal-body { padding:24px; }
.mform-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.mfield { margin-bottom:16px; }
.mfield label { display:block; font-size:12px; font-weight:600; color:var(--text-2); margin-bottom:6px; }
.mfield input, .mfield select { width:100%; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); padding:9px 13px; font-size:13px; font-family:inherit; color:var(--text-1); outline:none; box-sizing:border-box; }
.mfield input:focus, .mfield select:focus { border-color:var(--mint-mid); }
.modal-ft { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 22px; }
.btn-cancel { padding:9px 20px; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); font-size:13px; font-weight:600; color:var(--text-2); cursor:pointer; }
.btn-cancel:disabled { opacity:.5; cursor:not-allowed; }
.btn-save { padding:9px 20px; background:var(--forest-ink); color:#fff; border:none; border-radius:var(--r-sm); font-size:13px; font-weight:600; cursor:pointer; min-width:110px; display:flex; align-items:center; justify-content:center; gap:6px; }
.btn-save:hover:not(:disabled) { background:var(--forest-deep); }
.btn-save:disabled { opacity:.6; cursor:not-allowed; }

/* Spinner */
.spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
@keyframes spin { to { transform:rotate(360deg); } }

/* Toast */
.toast { position:fixed; top:20px; right:24px; z-index:9999; padding:12px 20px; border-radius:var(--r-sm); font-size:13px; font-weight:600; box-shadow:0 4px 20px rgba(0,0,0,.18); }
.toast-success { background:#2e7d52; color:#fff; }
.toast-error   { background:#a03020; color:#fff; }
.toast-enter-active, .toast-leave-active { transition:all .28s ease; }
.toast-enter-from, .toast-leave-to { opacity:0; transform:translateY(-10px); }

/* Responsive */
@media (max-width: 1024px) {
  .kpi-strip { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
  .att-grid { grid-template-columns: 1fr 250px; gap: 14px; }
}
@media (max-width: 768px) {
  .filter-bar { flex-direction: column; align-items: stretch; }
  .filter-tabs { overflow-x: auto; white-space: nowrap; width: 100%; }
  .ftab { flex: 0 0 auto; }
  .filter-right { justify-content: space-between; width: 100%; flex-wrap: wrap; }
  .fdate, .fselect, .export-btn { width: 100%; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .att-grid { grid-template-columns: 1fr; gap: 14px; }
  .att-table { min-width: 700px; font-size: 12px; }
  .card { overflow-x: auto; }
  .mform-row { grid-template-columns: 1fr; gap: 12px; }
}
@media (max-width: 480px) {
  .kpi-strip { grid-template-columns: 1fr; }
  .filter-tabs { flex-wrap: wrap; }
  .ftab { padding: 5px 10px; font-size: 12px; }
  .filter-right { flex-direction: column; gap: 8px; }
  .att-table { min-width: 640px; }
  .table-foot { flex-direction: column; gap: 10px; align-items: center; }
  .monthly-legend { flex-direction: column; gap: 8px; padding: 8px 18px 14px; }
}
.table-scroll {
  max-height: 620px;

  overflow-y: auto;

  overflow-x: auto;
}
.sticky-top-section {
  position: sticky;

  top: 10px;

  z-index: 100;

  background: #f7faf7;

  padding-bottom: 14px;

  margin-bottom: 14px;
}
</style>