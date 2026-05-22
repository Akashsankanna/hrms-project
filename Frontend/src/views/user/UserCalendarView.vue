<template>
  <UserLayout page-title="Calendar" page-sub="Stay on top of your schedule and team events." search-placeholder="Search events…">

    <!-- Controls -->
    <div class="cal-top">
      <div class="cal-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h2 class="cal-month-lbl">{{ monthLabel }}</h2>
        <button class="nav-btn" @click="nextMonth">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="today-btn" @click="goToday">Today</button>
      </div>
      <div class="cal-right">
        <!-- View toggle -->
        <div class="view-tabs">
          <button class="vtab" :class="{ active: view === 'month' }" @click="view = 'month'">Month</button>
          <button class="vtab" :class="{ active: view === 'list' }"  @click="view = 'list'">List</button>
        </div>
        <!-- Type filters -->
        <div class="type-filters">
          <button v-for="f in eventTypes" :key="f.type"
            class="tf-btn"
            :class="{ active: activeFilter === f.type }"
            :style="activeFilter === f.type ? { background: f.color + '28', borderColor: f.color, color: f.color } : {}"
            @click="activeFilter = activeFilter === f.type ? 'all' : f.type">
            {{ f.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main grid: Calendar + Sidebar -->
    <div class="cal-layout">

      <!-- Month view -->
      <div v-if="view === 'month'" class="card cal-main">
        <div class="cal-day-headers">
          <div v-for="d in dayNames" :key="d" class="cal-dh">{{ d }}</div>
        </div>
        <div class="cal-grid">
          <div v-for="(cell, i) in calCells" :key="i"
            class="cal-cell"
            :class="{
              'other-month': !cell.currentMonth,
              'is-today': cell.isToday,
              'is-selected': cell.date === selectedDay,
            }"
            @click="cell.currentMonth && (selectedDay = cell.date)">
            <div class="cell-num-wrap">
              <span class="cell-num">{{ cell.day }}</span>
            </div>
            <div class="cell-events">
              <div v-for="ev in cellEvents(cell.date)" :key="ev.id"
                class="cell-ev"
                :style="{ background: ev.color + '22', color: ev.color, borderLeft: '2.5px solid ' + ev.color }"
                @click.stop="selectedEvent = ev">
                {{ ev.title }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List view -->
      <div v-if="view === 'list'" class="card cal-list-view">
        <div class="clv-head">
          <div class="card-title">All Events</div>
          <span class="clv-count">{{ filteredEvents.length }} events</span>
        </div>
        <div class="ev-list">
          <div v-for="ev in filteredEvents" :key="ev.id" class="ev-list-row" @click="selectedEvent = ev">
            <div class="ev-date-box" :style="{ background: ev.color + '18' }">
              <div class="edb-day" :style="{ color: ev.color }">{{ ev.day }}</div>
              <div class="edb-mon" :style="{ color: ev.color }">{{ ev.month }}</div>
            </div>
            <div class="ev-body">
              <div class="ev-list-title">{{ ev.title }}</div>
              <div class="ev-list-meta">
                <span>{{ ev.time }}</span>
                <span class="ev-dot">·</span>
                <span>{{ ev.location }}</span>
              </div>
            </div>
            <span class="ev-tag" :style="{ background: ev.color + '22', color: ev.color }">{{ ev.type }}</span>
          </div>
          <div v-if="filteredEvents.length === 0" class="ev-empty">
            <span class="ev-empty-ico">📅</span>
            <p>No events found</p>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="cal-sidebar">

        <!-- Selected day -->
        <div class="card sd-card">
          <div class="sd-head">
            <div>
              <div class="sd-title">{{ selectedDayLabel }}</div>
              <div class="sd-sub">{{ selectedDayEvents.length }} event{{ selectedDayEvents.length !== 1 ? 's' : '' }}</div>
            </div>
            <button class="sd-add" @click="showAddModal = true">+</button>
          </div>
          <div class="sd-events">
            <div v-if="!selectedDayEvents.length" class="sd-empty">
              <span>🗓️</span> No events scheduled
            </div>
            <div v-for="ev in selectedDayEvents" :key="ev.id" class="sd-ev" @click="selectedEvent = ev">
              <div class="sd-bar" :style="{ background: ev.color }"></div>
              <div class="sd-ev-body">
                <div class="sd-ev-title">{{ ev.title }}</div>
                <div class="sd-ev-time">{{ ev.time }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming -->
        <div class="card upcoming-card">
          <div class="card-title" style="margin-bottom:16px">Upcoming Events</div>
          <div class="upcoming-list">
            <div v-for="ev in upcomingEvents" :key="ev.id" class="up-row" @click="selectedEvent = ev">
              <div class="up-color" :style="{ background: ev.color }"></div>
              <div class="up-body">
                <div class="up-title">{{ ev.title }}</div>
                <div class="up-date">{{ ev.day }} {{ ev.month }} · {{ ev.time }}</div>
              </div>
              <span class="up-tag" :style="{ background: ev.color + '22', color: ev.color }">{{ ev.type }}</span>
            </div>
          </div>
        </div>

        <!-- Holidays -->
        <div class="card holidays-card">
          <div class="card-title" style="margin-bottom:16px">Upcoming Holidays</div>
          <div class="hol-list">
            <div v-for="h in holidays" :key="h.name" class="hol-row">
              <div class="hol-date-box">
                <div class="hol-day">{{ h.day }}</div>
                <div class="hol-mon">{{ h.month }}</div>
              </div>
              <div>
                <div class="hol-name">{{ h.name }}</div>
                <div class="hol-type">{{ h.type }}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Event detail modal -->
    <div class="modal-overlay" v-if="selectedEvent" @click.self="selectedEvent = null">
      <div class="modal ev-modal">
        <div class="ev-modal-header" :style="{ background: selectedEvent.color }">
          <div>
            <div class="em-type">{{ selectedEvent.type }}</div>
            <div class="em-title">{{ selectedEvent.title }}</div>
          </div>
          <button class="em-close" @click="selectedEvent = null">✕</button>
        </div>
        <div class="ev-modal-body">
          <div class="em-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>{{ selectedEvent.time }}</span>
          </div>
          <div class="em-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
            <span>{{ selectedEvent.location }}</span>
          </div>
          <div class="em-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <span>{{ selectedEvent.departments }}</span>
          </div>
          <div v-if="selectedEvent.meetLink" class="ev-detail-row">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
    <path d="M10 14L21 3M21 3H15M21 3V9"/>
    <path d="M14 10v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h7"/>
  </svg>

  <a
    :href="selectedEvent.meetLink"
    target="_blank"
    style="color: #3b82f6; text-decoration: underline;"
  >
    Join Meeting
  </a>
</div>
          <div v-if="selectedEvent.desc" class="em-desc">{{ selectedEvent.desc }}</div>
          <button class="em-close-btn" @click="selectedEvent = null">Close</button>
        </div>
      </div>
    </div>

    <!-- Add event modal (simplified) -->
    <div class="modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title">Add Event</span>
          <button class="modal-close" @click="showAddModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="mf">
            <label>Title</label>
            <input type="text" v-model="newEv.title" placeholder="Event title" class="mi"/>
          </div>
          <div class="mf-row">
            <div class="mf"><label>Date</label><input type="date" v-model="newEv.date" class="mi"/></div>
            <div class="mf"><label>Time</label><input type="time" v-model="newEv.time" class="mi"/></div>
          </div>
          <div class="mf">
            <label>Type</label>
            <select v-model="newEv.type" class="mi">
              <option v-for="t in eventTypes" :key="t.type" :value="t.type">{{ t.label }}</option>
            </select>
          </div>
        </div>
        <div class="modal-ft">
          <button class="mf-cancel" @click="showAddModal = false">Cancel</button>
          <button class="mf-save" @click="addEvent">Add Event</button>
        </div>
      </div>
    </div>

  </UserLayout>
</template>

<script>
import UserLayout from '../../components/UserLayout.vue'
import { calendarAPI } from '@/services/api'

// ✅ Normalize event
function normalizeEvent(ev) {
const start = new Date(ev.startTime)
  return {
    id: ev.id,
    title: ev.title,
date: new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(start),    month: start.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    time: ev.isAllDay
      ? 'All Day'
      : start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    location: ev.location || '—',
    departments: ev.department?.name || 'All',
    type: ev.eventType?.toLowerCase() || 'meeting',
    color: getColor(ev.eventType),
    desc: ev.description || '',
    meetLink: ev.meetLink || null

  }
}

// ✅ Normalize holiday
function normalizeHoliday(h) {

  // ✅ India timezone safe parsing
  const d = new Date(h.date)

  const indiaDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d)

  const [year, month, day] = indiaDate.split('-')

  return {
    id: h.id,

    day,

    month: new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short'
    }).format(d).toUpperCase(),

    name: h.name,

    type: h.type,

    date: `${year}-${month}-${day}`
  }
}

// ✅ Color mapping
function getColor(type) {
  const map = {
    MEETING: '#657D65',
    COMPANY_EVENT: '#757872',
    TRAINING: '#c07b30',
    REMINDER: '#e05a4a'
  }
  return map[type] || '#657D65'
}

export default {
  name: 'CalendarView',
  components: { UserLayout },

  data() {
    const today = new Date()
    return {
      today,
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      view: 'month',
      selectedDay: today.toISOString().split('T')[0],
      selectedEvent: null,
      showAddModal: false,
      activeFilter: 'all',

      dayNames: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],

      // ❌ remove static
      events: [],
      holidays: [],

      loading: false,
      errorMsg: ''
    }
  },

  computed: {
    monthLabel() {
      return new Date(this.currentYear, this.currentMonth)
        .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    },

    calCells() {
      const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay()
      const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate()
      const daysInPrev = new Date(this.currentYear, this.currentMonth, 0).getDate()
const todayStr = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(this.today)
      const cells = []

      for (let i = firstDay - 1; i >= 0; i--) {
        cells.push({ day: daysInPrev - i, currentMonth: false, date: '', isToday: false })
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(this.currentYear, this.currentMonth, d)
const dateStr = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(dt)
        cells.push({
          day: d,
          currentMonth: true,
          date: dateStr,
          isToday: dateStr === todayStr
        })
      }

      while (cells.length < 42) {
        cells.push({ day: '', currentMonth: false })
      }

      return cells
    },

    filteredEvents() {
      if (this.activeFilter === 'all') return this.events
      return this.events.filter(e => e.type === this.activeFilter)
    },

    selectedDayLabel() {
      const d = new Date(this.selectedDay + 'T00:00:00')
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    },

    selectedDayEvents() {
      return this.events.filter(e => e.date === this.selectedDay)
    },

    upcomingEvents() {
      const todayStr = this.today.toISOString().split('T')[0]
      return this.events.filter(e => e.date >= todayStr).slice(0, 4)
    }
  },

  methods: {
    prevMonth() {
      if (this.currentMonth === 0) {
        this.currentMonth = 11
        this.currentYear--
      } else this.currentMonth--
    },

    nextMonth() {
      if (this.currentMonth === 11) {
        this.currentMonth = 0
        this.currentYear++
      } else this.currentMonth++
    },

    goToday() {
      this.currentYear = this.today.getFullYear()
      this.currentMonth = this.today.getMonth()
      this.selectedDay = this.today.toISOString().split('T')[0]
    },

    cellEvents(date) {
if (!date) return []

  // ✅ normal events
  const events = this.filteredEvents.filter(e => e.date === date)

  // ✅ holidays
  const holidays = this.holidays
    .filter(h => h.date === date)
    .map(h => ({
      id: 'h-' + h.id,
      title: h.name,
      color: '#e05a4a',   // 🔥 red
      isHoliday: true
    }))

  return [...holidays, ...events]    },

    // ✅ MAIN API CALL
    async fetchCalendarData() {
      this.loading = true

      try {
        const y = this.currentYear
        const m = String(this.currentMonth + 1).padStart(2, '0')
        const lastDay = new Date(y, this.currentMonth + 1, 0).getDate()

        const from = `${y}-${m}-01`
        const to = `${y}-${m}-${lastDay}`

        const res = await calendarAPI.getEvents({ from, to })

        this.events = (res.data.events || []).map(normalizeEvent)
        this.holidays = (res.data.holidays || []).map(normalizeHoliday)

      } catch (err) {
        console.error(err)
        this.errorMsg = "Failed to load calendar"
      } finally {
        this.loading = false
      }
    }
  },

  // ✅ LOAD ON START
  async mounted() {
    await this.fetchCalendarData()
  },

  // ✅ AUTO REFRESH
  watch: {
    currentMonth() {
      this.fetchCalendarData()
    },
    currentYear() {
      this.fetchCalendarData()
    }
  }
}
</script>

<style scoped>

.ev-detail-row svg { width:15px; height:15px; color:var(--text-3); flex-shrink:0; }

.card { background: #fff; border-radius: var(--r-xl); border: 1px solid #e8ece4; }
.card-title { font-family: var(--font-serif); font-size: 17px; color: #1e261f; }

/* Top controls */
.cal-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 20px; }
.cal-nav  { display: flex; align-items: center; gap: 10px; }
.nav-btn  {
  width: 30px; height: 30px; border: 1px solid #e4e8e0;
  background: #fff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s;
}
.nav-btn:hover { background: #f0f5f0; }
.nav-btn svg { width: 14px; height: 14px; color: var(--forest); }
.cal-month-lbl { font-family: var(--font-serif); font-size: 20px; color: #1e261f; min-width: 200px; text-align: center; }
.today-btn {
  padding: 6px 14px; background: var(--forest); color: #fff;
  border: none; border-radius: 20px; font-size: 12px; font-weight: 600; font-family: var(--font-sans);
  cursor: pointer; transition: background .18s;
}
.today-btn:hover { background: var(--forest); }

.cal-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.view-tabs { display: flex; gap: 2px; background: #eef0ec; border-radius: 20px; padding: 3px; }
.vtab {
  padding: 5px 14px; border-radius: 20px; border: none; background: transparent;
  font-size: 12.5px; font-weight: 500; color: var(--stone); cursor: pointer; transition: all .18s; font-family: var(--font-sans);
}
.vtab.active { background: var(--forest-dk);  font-weight: 600; }

.type-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.tf-btn {
  padding: 5px 12px; border-radius: 20px; border: 1px solid #e4e8e0;
  background: #fff; font-size: 11.5px; font-weight: 600; color: var(--stone);
  cursor: pointer; font-family: var(--font-sans); transition: all .18s;
}
.tf-btn:hover { background: #f0f5f0; }

/* Calendar layout */
.cal-layout { display: grid; grid-template-columns: 1fr 272px; gap: 20px; }

/* Month grid */
.cal-main { overflow: hidden; }
.cal-day-headers {
  display: grid; grid-template-columns: repeat(7, 1fr);
  background: #f8faf8; border-bottom: 1px solid #eef0ec;
}
.cal-dh { padding: 12px 0; text-align: center; font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #b0b5ae; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
.cal-cell {
  min-height: 88px; padding: 8px 6px;
  border-right: 1px solid #eef0ec;
  border-bottom: 1px solid #eef0ec;
  cursor: pointer; transition: background .15s;
}
.cal-cell:nth-child(7n) { border-right: none; }
.cal-cell:hover:not(.other-month) { background: #f5faf5; }
.cal-cell.other-month { background: #fafafa; }
.cal-cell.is-today .cell-num {
  background: var(--forest-dk); color: #fff !important;
  border-radius: 50%; width: 24px; height: 24px;
  display: inline-flex; align-items: center; justify-content: center;
}
.cal-cell.is-selected:not(.is-today) { background: rgba(169,233,173,.12); }
.cell-num-wrap { margin-bottom: 4px; }
.cell-num { font-size: 12.5px; font-weight: 500; color: #4a5a4b; display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; }
.other-month .cell-num { color: #d0d4ce; }

.cell-events { display: flex; flex-direction: column; gap: 2px; }
.cell-ev {
  font-size: 10px; font-weight: 600;
  padding: 2px 5px; border-radius: 3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;
}
.cell-ev:hover { opacity: .8; }

/* List view */
.cal-list-view { overflow: hidden; }
.clv-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #eef0ec; }
.clv-count { font-size: 12px; color: var(--stone); }
.ev-list { }
.ev-list-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 24px; border-bottom: 1px solid #eef0ec; cursor: pointer; transition: background .15s;
}
.ev-list-row:last-child { border-bottom: none; }
.ev-list-row:hover { background: #f8faf8; }
.ev-date-box { width: 44px; height: 50px; border-radius: var(--r-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.edb-day { font-family: var(--font-serif); font-size: 18px; line-height: 1; }
.edb-mon { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; margin-top: 1px; }
.ev-body { flex: 1; }
.ev-list-title { font-size: 13.5px; font-weight: 600; color: #1e261f; margin-bottom: 3px; }
.ev-list-meta { font-size: 12px; color: var(--stone); display: flex; gap: 6px; align-items: center; }
.ev-dot { color: #d0d4ce; }
.ev-tag { font-size: 10.5px; font-weight: 700; padding: 3px 10px; border-radius: 20px; flex-shrink: 0; text-transform: capitalize; }
.ev-empty { text-align: center; padding: 40px; color: var(--stone); }
.ev-empty-ico { font-size: 32px; display: block; margin-bottom: 8px; }

/* Sidebar */
.cal-sidebar { display: flex; flex-direction: column; gap: 16px; }

.sd-card { overflow: hidden; }
.sd-head { display: flex; align-items: flex-start; justify-content: space-between; padding: 20px 20px 16px; border-bottom: 1px solid #eef0ec; }
.sd-title { font-family: var(--font-serif); font-size: 15px; color: #1e261f; }
.sd-sub   { font-size: 11px; color: var(--stone); margin-top: 2px; }
.sd-add   { width: 26px; height: 26px; border-radius: 50%; background: var(--forest-dk); color: #fff; border: none; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
.sd-add:hover { background: var(--forest); }

.sd-events { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.sd-empty { font-size: 12px; color: #b0b5ae; text-align: center; padding: 12px 0; }
.sd-ev {
  display: flex; align-items: flex-start; gap: 10px;
  background: #f8faf8; border-radius: var(--r-sm); padding: 10px;
  cursor: pointer; transition: box-shadow .15s;
}
.sd-ev:hover { box-shadow: 0 2px 8px rgba(61,82,64,.08); }
.sd-bar { width: 3px; align-self: stretch; border-radius: 3px; flex-shrink: 0; min-height: 36px; }
.sd-ev-title { font-size: 12px; font-weight: 600; color: #1e261f; margin-bottom: 2px; }
.sd-ev-time  { font-size: 11px; color: var(--stone); }

.upcoming-card { padding: 20px; }
.upcoming-list { display: flex; flex-direction: column; gap: 2px; }
.up-row {
  display: flex; align-items: center; gap: 10px; padding: 9px 0;
  border-bottom: 1px solid #eef0ec; cursor: pointer; transition: background .15s;
}
.up-row:last-child { border-bottom: none; }
.up-row:hover { background: #f8faf8; margin: 0 -20px; padding: 9px 20px; border-radius: var(--r-sm); }
.up-color { width: 3px; height: 32px; border-radius: 3px; flex-shrink: 0; }
.up-body { flex: 1; }
.up-title { font-size: 12.5px; font-weight: 600; color: #1e261f; }
.up-date  { font-size: 11px; color: var(--stone); margin-top: 1px; }
.up-tag   { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; flex-shrink: 0; text-transform: capitalize; }

.holidays-card { padding: 20px; }
.hol-list { display: flex; flex-direction: column; gap: 10px; }
.hol-row  { display: flex; align-items: center; gap: 12px; }
/* 🔥 RED HOLIDAY STYLE */
.hol-date-box {
  width: 38px;
  height: 42px;
  background: rgba(224, 90, 74, 0.15);   /* light red */
  border-radius: var(--r-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hol-day {
  font-family: var(--font-serif);
  font-size: 16px;
  color: #e05a4a;   /* red */
  line-height: 1;
}

.hol-mon {
  font-size: 8px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: #e05a4a;   /* red */
  margin-top: 2px;
}

.hol-name {
  font-size: 12.5px;
  font-weight: 600;
  color: #e05a4a;   /* red highlight */
}

.hol-type {
  font-size: 11px;
  color: #b94a3a;   /* darker red */
  margin-top: 1px;
}
/* Modals */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.32); z-index: 500;
  display: flex; align-items: center; justify-content: center;
}
.modal { background: #fff; border-radius: var(--r-xl); width: 440px; max-width: 95vw; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.16); }
.modal-hd { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid #eef0ec; }
.modal-title { font-family: var(--font-serif); font-size: 18px; color: #1e261f; }
.modal-close { background: none; border: none; font-size: 15px; color: var(--stone); cursor: pointer; width: 28px; height: 28px; border-radius: 50%; }
.modal-close:hover { background: #f0f5f0; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.mf { display: flex; flex-direction: column; gap: 6px; }
.mf label { font-size: 10.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: var(--stone); }
.mf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.mi { border: 1.5px solid #dde3da; border-radius: var(--r-sm); padding: 9px 13px; font-size: 13px; font-family: var(--font-sans); color: #1e261f; outline: none; transition: border-color .18s; width: 100%; background: #fff; }
.mi:focus { border-color: var(--mint); }
.modal-ft { display: flex; justify-content: flex-end; gap: 10px; padding: 0 24px 20px; }
.mf-cancel { padding: 9px 18px; border: 1px solid #e4e8e0; background: #fff; border-radius: var(--r-sm); font-size: 13px; font-weight: 600; color: var(--stone); cursor: pointer; font-family: var(--font-sans); }
.mf-save   { padding: 9px 18px; background: var(--forest-dk); color: #fff; border: none; border-radius: var(--r-sm); font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-sans); }
.mf-save:hover { background: var(--forest); }

/* Event detail modal */
.ev-modal { }
.ev-modal-header { padding: 24px; display: flex; align-items: flex-start; justify-content: space-between; }
.em-type  { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.7); margin-bottom: 4px; }
.em-title { font-family: var(--font-serif); font-size: 20px; color: #fff; }
.em-close { background: rgba(255,255,255,.2); border: none; color: #fff; border-radius: 50%; width: 28px; height: 28px; font-size: 13px; cursor: pointer; }
.em-close:hover { background: rgba(255,255,255,.3); }
.ev-modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 12px; }
.em-row { display: flex; align-items: center; gap: 10px; font-size: 13.5px; color: #4a5a4b; }
.em-row svg { width: 15px; height: 15px; color: var(--stone); flex-shrink: 0; }
.em-desc { font-size: 13px; color: var(--stone); background: #f8faf8; border-radius: var(--r-sm); padding: 12px; line-height: 1.6; }
.em-close-btn { align-self: flex-end; padding: 8px 20px; background: var(--forest-dk); color: #fff; border: none; border-radius: var(--r-sm); font-size: 13px; font-weight: 600; cursor: pointer; font-family: var(--font-sans); }
.em-close-btn:hover { background: var(--forest); }
</style>
