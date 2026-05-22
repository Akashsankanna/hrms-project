<template>
  <AdminLayout page-title="Calendar" add-label="Add Event" @add="openAddModal">

    <!-- Top Controls -->
    <div class="cal-controls">
      <div class="month-nav">
        <button class="nav-btn" @click="prevMonth">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="month-label">{{ monthLabel }}</div>
        <button class="nav-btn" @click="nextMonth">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <button class="today-btn" @click="goToday">Today</button>
      </div>
      <div class="ctrl-right">
        <div class="view-tabs">
          <button class="vtab" :class="{ active: view === 'month' }" @click="view = 'month'">Month</button>
          <button class="vtab" :class="{ active: view === 'list' }"  @click="view = 'list'">List</button>
        </div>
        <div class="event-filters">
          <span v-for="f in eventTypes" :key="f.type"
            class="etype-filter" :class="{ active: activeFilter === f.type }"
            :style="activeFilter === f.type ? { background: f.color + '22', borderColor: f.color, color: f.color } : {}"
            @click="activeFilter = activeFilter === f.type ? 'all' : f.type">
            {{ f.label }}
          </span>
        </div>
      </div>
    </div>

    <div class="cal-layout">
      <!-- Calendar Grid -->
      <div class="cal-main">

        <!-- Month view -->
        <div v-if="view === 'month'" class="card month-view">
          <div class="day-headers">
            <div class="dh" v-for="d in dayNames" :key="d">{{ d }}</div>
          </div>
          <div class="cal-grid">
            <div v-for="(cell, i) in calCells" :key="i"
              class="cal-cell"
              :class="{
                'other-month': !cell.currentMonth,
                'today': cell.isToday,
                'selected': cell.date === selectedDay
              }"
              @click="selectedDay = cell.date">
              <div class="cell-num">{{ cell.day }}</div>
              <div class="cell-events">
                <div v-for="ev in cellEvents(cell.date)" :key="ev.id"
                  class="cell-ev"
                  :style="{ background: ev.color + '22', color: ev.color, borderLeft: '3px solid ' + ev.color }"
                  @click.stop="selectedEvent = ev">
                  {{ ev.title }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- List view -->
        <div v-if="view === 'list'" class="card">
          <div class="card-hd">
            <div class="card-title">All Events</div>
            <div class="card-sub">{{ filteredEvents.length }} events this month</div>
          </div>
          <div class="list-view">
            <div v-for="ev in filteredEvents" :key="ev.id" class="ev-list-row" @click="selectedEvent = ev">
              <div class="ev-date-box" :style="{ background: ev.color + '22' }">
                <div class="evd" :style="{ color: ev.color }">{{ ev.day }}</div>
                <div class="evm" :style="{ color: ev.color }">{{ ev.month }}</div>
              </div>
              <div class="ev-body">
                <div class="ev-title">{{ ev.title }}</div>
                <div class="ev-meta">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ ev.time }}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-left:8px"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
                  {{ ev.location }}
                </div>
              </div>
              <span class="ev-tag" :style="{ background: ev.color + '22', color: ev.color }">{{ ev.type }}</span>
            </div>
          </div>
        </div>

        <!-- Week view placeholder -->
        <div v-if="view === 'week'" class="card week-placeholder">
          <div class="wp-inner">
            <div class="wp-icon">📅</div>
            <div class="wp-title">Week View</div>
            <div class="wp-sub">Shows a detailed 7-day schedule view</div>
          </div>
        </div>

      </div>

      <!-- Right Sidebar -->
      <div class="cal-sidebar">
 
  <!-- ── Selected day events ───────────────────────────────────── -->
  <div class="card sidebar-events">
    <div class="card-hd">
      <div>
        <div class="card-title">{{ selectedDayLabel }}</div>
        <div class="card-sub">{{ selectedDayEvents.length }} events scheduled</div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="add-sm-btn" title="Add Event"    @click="openAddModal">+</button>
      </div>
    </div>
    <div class="sd-events">
      <div v-if="selectedDayEvents.length === 0" class="no-events">
        <div class="ne-ico">🗓️</div>
        <div class="ne-txt">No events today</div>
      </div>
      <div v-for="ev in selectedDayEvents" :key="ev.id" class="sd-ev" @click="selectedEvent = ev">
        <div class="sd-ev-bar" :style="{ background: ev.color }"></div>
        <div class="sd-ev-body">
          <div class="sd-ev-title">{{ ev.title }}</div>
          <div class="sd-ev-meta">{{ ev.time }} · {{ ev.location }}</div>
          <div class="sd-ev-dept">{{ ev.departments }}</div>
        </div>
        <button class="sd-del" @click.stop="deleteEvent(ev.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

        <!-- Upcoming events -->
        <div class="card">
    <div class="card-hd">
      <div class="card-title">Upcoming</div>
      <button class="card-link">All →</button>
    </div>
    <div class="upcoming-list">
      <div v-if="upcomingEvents.length === 0" style="padding:12px 22px; font-size:12px; color:var(--text-3);">
        No upcoming events
      </div>
      <div v-for="ev in upcomingEvents" :key="ev.id" class="up-row">
        <div class="up-dot" :style="{ background: ev.color }"></div>
        <div class="up-body">
          <div class="up-title">{{ ev.title }}</div>
          <div class="up-date">{{ ev.day }} {{ ev.month }} · {{ ev.time }}</div>
        </div>
        <span class="up-tag" :style="{ background: ev.color + '22', color: ev.color }">{{ ev.type }}</span>
      </div>
    </div>
  </div>

        <!-- Holidays -->
        <div class="card">
          <div class="card-hd">
            <div class="card-title">Public Holidays</div>
            <button class="add-sm-btn add-hol-btn" title="Add Holiday" @click="openHolidayModal">+</button>

          </div>
          <div>
</div>

          <div class="hol-list">
            <div v-for="h in holidays" :key="h.name" class="hol-row">
              <div class="hol-date">
                <div class="hd-num">{{ h.day }}</div>
                <div class="hd-mon">{{ h.month }}</div>
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

    <!-- Event Detail Modal -->
    <div class="modal-overlay" v-if="selectedEvent" @click.self="selectedEvent = null">
      <div class="modal ev-modal">
        <div class="ev-modal-hd" :style="{ background: selectedEvent.color }">
          <div>
            <div class="ev-modal-type">{{ selectedEvent.type }}</div>
            <div class="ev-modal-title">{{ selectedEvent.title }}</div>
          </div>
          <button class="modal-close white" @click="selectedEvent = null">✕</button>
        </div>
        <div class="ev-modal-body">
          <div class="ev-detail-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{{ selectedEvent.day }} {{ selectedEvent.month }} · {{ selectedEvent.time }}</span>
          </div>
          <div class="ev-detail-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><circle cx="12" cy="11" r="3"/></svg>
            <span>{{ selectedEvent.location }}</span>
          </div>
          <div class="ev-detail-row">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>
<span>

  <!-- ASSIGN EVENT -->
  <template v-if="selectedEvent.visibility === 'ASSIGN'">

    {{
      selectedEvent.attendees
        ?.map(a =>
          `${a.employee?.firstName || ''} ${a.employee?.lastName || ''}`
        )
        .join(', ')
    }}

  </template>

  <!-- DEPARTMENT EVENT -->
  <template v-else-if="selectedEvent.visibility === 'DEPARTMENT'">

    {{ selectedEvent.department?.name }}

  </template>

  <!-- PUBLIC EVENT -->
  <template v-else>

    All Employees

  </template>

</span>
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
          <p class="ev-desc">{{ selectedEvent.desc }}</p>
        </div>
        <div class="modal-ft">
          <button class="btn-cancel" @click="deleteEvent(selectedEvent.id); selectedEvent = null">Delete</button>
          <button class="btn-save">Edit Event</button>
        </div>
      </div>
    </div>

    <!-- Add Event Modal -->
    <div class="modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
      <div class="modal">
        <div class="modal-hd">
          <div class="modal-title">Add New Event</div>
          <button class="modal-close" @click="showAddModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="mfield">
  <label>Event Title *</label>
  <input type="text" v-model="newEvent.title">
</div>

<div class="mform-row">
  <div class="mfield">
    <label>Date *</label>
    <input type="date" v-model="newEvent.date">
  </div>

  <div class="mfield">
    <label>Start Time *</label>
    <input type="time" v-model="newEvent.startTime">
  </div>

  <div class="mfield">
    <label>End Time *</label>
    <input type="time" v-model="newEvent.endTime">
  </div>
</div>

<div class="mform-row">
  <div class="mfield">
    <label>Event Type</label>
    <select v-model="newEvent.type">
      <option v-for="t in backendEventTypes" :key="t.value" :value="t.value">
        {{ t.label }}
      </option>
    </select>
  </div>

  <div class="mfield">
    <label>Visibility</label>
    <select v-model="newEvent.visibility">
      <option value="PUBLIC">Public</option>
      <option value="DEPARTMENT">Department</option>
      <option value="ASSIGN">Assign</option>
    </select>
  </div>
</div>

<!-- Department (only if needed) -->
<div class="mfield" v-if="newEvent.visibility === 'DEPARTMENT'">
  <label>Department</label>
  <select v-model="newEvent.departmentId">
  <option value="">Select</option>
  <option
    v-for="d in departments"
    :key="d.id"
    :value="d.id"
  >
    {{ d.name }}
  </option>
</select>
</div>

<!-- Assign only (only if needed) -->
<div v-if="newEvent.visibility === 'ASSIGN'" class="form-group">

  <label>Select Employees</label>

  <!-- Selected Names -->
  <div
    v-if="selectedEmployees.length"
    class="selected-employee-box"
  >

    <span
      v-for="emp in selectedEmployees"
      :key="emp.id"
      class="selected-chip"
    >
      {{ emp.firstName }} {{ emp.lastName }}
    </span>

  </div>

  <!-- Employee Checkbox List -->
  <div class="employee-select-list">

    <label
      v-for="emp in employees"
      :key="emp.id"
      class="employee-option"
    >

      <input
        type="checkbox"
        :value="emp.id"
        v-model="newEvent.attendeeIds"
      />

      {{ emp.firstName }} {{ emp.lastName }}

    </label>

  </div>

</div>



<div class="mfield">
  <label>Meeting Link</label>
  <input type="text" v-model="newEvent.meetLink">
</div>

<div class="mfield">
  <label>Description</label>
  <input type="text" v-model="newEvent.description">
</div>

<!-- ✅ RECURRING -->
<div class="mfield">
  <label>
    <input type="checkbox" v-model="newEvent.isRecurring">
    Recurring Event
  </label>
</div>

<div v-if="newEvent.isRecurring">

  <div class="mfield">
    <label>Repeat Days</label>
    <select v-model="newEvent.recurrenceDays" multiple>
      <option value="MO">Mon</option>
      <option value="TU">Tue</option>
      <option value="WE">Wed</option>
      <option value="TH">Thu</option>
      <option value="FR">Fri</option>
    </select>
  </div>

  <div class="mfield">
    <label>End Date</label>
    <input type="date" v-model="newEvent.recurrenceEnd">
  </div>

</div>
        </div>
        <div class="modal-ft">
          <button class="btn-cancel" @click="showAddModal = false">Cancel</button>
<button class="btn-save" @click="addEvent" :disabled="saving">
  {{ saving ? 'Saving…' : 'Add Event' }}
</button>
        </div>
      </div>
    </div>


    <div class="modal-overlay" v-if="showHolidayModal" @click.self="closeHolidayModal">
  <div class="modal">
    <div class="modal-hd">
      <div class="modal-title">Add Public Holiday</div>
      <button class="modal-close" @click="closeHolidayModal">✕</button>
    </div>
 
    <div class="modal-body">
      <!-- Error -->
      <div v-if="holidayError" style="
        background:rgba(255,207,193,.2);
        border:1px solid rgba(255,150,130,.4);
        border-radius:8px; padding:10px 14px;
        font-size:12px; color:#8a3525; margin-bottom:14px;
      ">{{ holidayError }}</div>
 
      <div class="mfield">
        <label>Holiday Name *</label>
        <input
          type="text"
          v-model="newHoliday.name"
          placeholder="e.g. Diwali"
        >
      </div>
 
      <div class="mform-row">
        <div class="mfield">
          <label>Date *</label>
          <input type="date" v-model="newHoliday.date">
        </div>
        <div class="mfield">
          <label>Type *</label>
          <select v-model="newHoliday.type">
            <option value="NATIONAL">National Holiday</option>
            <option value="REGIONAL">Regional Holiday</option>
            <option value="OPTIONAL">Optional Holiday</option>
            <option value="COMPANY">Company Holiday</option>
          </select>
        </div>
      </div>
 
      <div class="mfield" v-if="newHoliday.type === 'REGIONAL'">
        <label>State Code</label>
        <input
          type="text"
          v-model="newHoliday.stateCode"
          placeholder="e.g. MH for Maharashtra, KA for Karnataka"
          maxlength="2"
          style="text-transform:uppercase"
        >
        <div style="font-size:11px; color:var(--text-3); margin-top:4px;">
          Leave blank to apply to all offices
        </div>
      </div>
 
      <div class="mfield">
        <label>Description</label>
        <input
          type="text"
          v-model="newHoliday.description"
          placeholder="Optional note about this holiday"
        >
      </div>
    </div>
 
    <div class="modal-ft">
      <button class="btn-cancel" @click="closeHolidayModal">Cancel</button>
      <button class="btn-save" @click="addHoliday" :disabled="holidaySaving">
        <span v-if="holidaySaving">Saving…</span>
        <span v-else>Add Holiday</span>
      </button>
    </div>
  </div>
</div>

  </AdminLayout>
</template>

<script>
import AdminLayout from '../components/AdminLayout.vue'
import { calendarAPI, lookupAPI } from '../services/api.js'

const EVENT_TYPE_MAP = {
  MEETING:       { type: 'meeting',  color: '#657D65' },
  TRAINING:      { type: 'training', color: '#9c6f0c' },
  COMPANY_EVENT: { type: 'review',   color: '#757872' },
  BIRTHDAY:      { type: 'holiday',  color: '#86d98b' },
  ANNIVERSARY:   { type: 'holiday',  color: '#86d98b' },
  REMINDER:      { type: 'deadline', color: '#f0a090' },
  OTHER:         { type: 'meeting',  color: '#657D65' },
}

const HOLIDAY_TYPE_LABEL = {
  NATIONAL: 'National Holiday',
  REGIONAL: 'Regional Holiday',
  OPTIONAL: 'Optional Holiday',
  COMPANY:  'Company Holiday',
}

function normalizeEvent(ev) {
  const start   = new Date(ev.startTime)
  const typeMap = EVENT_TYPE_MAP[ev.eventType] || EVENT_TYPE_MAP.OTHER

  const timeStr = ev.isAllDay
    ? 'All Day'
    : start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

  const depts =
  ev.visibility === 'PUBLIC'
    ? 'All Departments'
    : ev.department?.name || 'Department Event'

  // Build date string without UTC conversion (fixes IST 1-day shift bug)
  const dateStr = [
    start.getFullYear(),
    String(start.getMonth() + 1).padStart(2, '0'),
    String(start.getDate()).padStart(2, '0'),
  ].join('-')

  return {
    id:          ev.id,
    title:       ev.title,
    day:         String(start.getDate()).padStart(2, '0'),
    month:       start.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase(),
    date:        dateStr,
    time:        timeStr,
    location:    ev.location    || '—',
    departments: depts,
    type:        typeMap.type,
    color:       typeMap.color,
    desc:        ev.description || '',
    meetLink:    ev.meetLink    || null,
    visibility:  ev.visibility,
    status:      ev.status,
    department:  ev.department  || null,
    attendees: ev.attendees || [],
  }
}

function normalizeHoliday(h) {
  // Slice directly — never parse through Date() to avoid UTC shift
  const dateStr      = h.date.split('T')[0]
  const [y, m, day]  = dateStr.split('-')
  return {
    id:    h.id,
    day,
    month: new Date(+y, +m - 1, +day)
             .toLocaleDateString('en-IN', { month: 'short' })
             .toUpperCase(),
    date:  dateStr,
    name:  h.name,
    type:  HOLIDAY_TYPE_LABEL[h.type] || h.type,
  }
}

export default {
  name: 'CalendarView',
  components: { AdminLayout },

  data() {
    const today = new Date()
    return {
      today,
      currentYear:  today.getFullYear(),
      currentMonth: today.getMonth(),
      view:         'month',
      selectedDay:  [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, '0'),
        String(today.getDate()).padStart(2, '0'),
      ].join('-'),
      selectedEvent:  null,
      showAddModal:   false,
      showHolidayModal: false,
      activeFilter:   'all',

      // State
      loading:       false,
      saving:        false,
      holidaySaving: false,
      errorMsg:      '',
      holidayError:  '',
      successMsg:    '',

      dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

      // Departments from backend
      departments: [],
      employees: [],

      // Notifications
      notifications:  [],
      unreadCount:    0,
      showNotifPanel: false,
      notifLoading:   false,

      // New event form
      newEvent: {
        title:        '',
        date:         '',
        startTime:    '',
        endTime:      '',
        type:         'MEETING',
        visibility:   'PUBLIC',
        departmentId: '',
        location:     '',
        meetLink:     '',
        description:  '',
        isAllDay:     false,
        attendeeIds:  [],
      },

      // New holiday form
      newHoliday: {
        name:        '',
        date:        '',
        type:        'NATIONAL',
        stateCode:   '',
        description: '',
      },

      // Data
      events:   [],
      holidays: [],

      // Filter chips
      eventTypes: [
        { type: 'meeting',  label: 'Meeting',  color: '#657D65' },
        { type: 'holiday',  label: 'Holiday',  color: '#86d98b' },
        { type: 'deadline', label: 'Deadline', color: '#f0a090' },
        { type: 'training', label: 'Training', color: '#9c6f0c' },
        { type: 'review',   label: 'Review',   color: '#757872' },
      ],

      backendEventTypes: [
        { value: 'MEETING',       label: 'Meeting'       },
        { value: 'TRAINING',      label: 'Training'      },
        { value: 'COMPANY_EVENT', label: 'Company Event' },
        { value: 'REMINDER',      label: 'Reminder'      },
        { value: 'OTHER',         label: 'Other'         },
      ],
    }
  },

  async mounted() {
    await Promise.all([
      this.fetchMonthData(),
      this.fetchDepartments(),
      this.fetchNotifications(),
      this.fetchEmployees(),

    ])
  },

  watch: {
    currentMonth() { this.fetchMonthData() },
    currentYear()  { this.fetchMonthData() },
  },

  computed: {
    monthLabel() {
      return new Date(this.currentYear, this.currentMonth)
        .toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    },
    selectedEmployees() {

  return this.employees.filter(emp =>
    this.newEvent.attendeeIds.includes(emp.id)
  )

},

    calCells() {

  const firstDay =
    new Date(this.currentYear, this.currentMonth, 1).getDay()

  const daysInMonth =
    new Date(this.currentYear, this.currentMonth + 1, 0).getDate()

  const daysInPrev =
    new Date(this.currentYear, this.currentMonth, 0).getDate()

  const cells = []

  // Previous month cells
  for (let i = firstDay - 1; i >= 0; i--) {

    cells.push({
      day: daysInPrev - i,
      currentMonth: false,
      date: this.formatDate(
        this.currentYear,
        this.currentMonth - 1,
        daysInPrev - i
      ),
      isToday: false
    })
  }

  // Current month cells
  for (let d = 1; d <= daysInMonth; d++) {

    const dateStr = this.formatDate(
      this.currentYear,
      this.currentMonth,
      d
    )

    cells.push({
      day: d,
      currentMonth: true,
      date: dateStr,

      // ✅ TODAY CHECK
      isToday: dateStr === this.todayStr
    })
  }

  // Next month cells
  const remaining = 42 - cells.length

  for (let d = 1; d <= remaining; d++) {

    cells.push({
      day: d,
      currentMonth: false,
      date: this.formatDate(
        this.currentYear,
        this.currentMonth + 1,
        d
      ),
      isToday: false
    })
  }

  return cells
},

    todayStr() {
      return [
        this.today.getFullYear(),
        String(this.today.getMonth() + 1).padStart(2, '0'),
        String(this.today.getDate()).padStart(2, '0'),
      ].join('-')
    },

    filteredEvents() {
      return (this.events || []).filter(e =>
        this.activeFilter === 'all' || e.type === this.activeFilter
      )
    },

    selectedDayLabel() {
      if (!this.selectedDay) return 'Today'
      const [y, m, d] = this.selectedDay.split('-')
      return new Date(+y, +m - 1, +d)
        .toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    },

    selectedDayEvents() {
      return this.cellEvents(this.selectedDay)
    },

    upcomingEvents() {
      return this.filteredEvents.filter(e => e.date >= this.todayStr).slice(0, 5)
    },

    monthHolidays() {
      const m      = String(this.currentMonth + 1).padStart(2, '0')
      const prefix = `${this.currentYear}-${m}`
      return this.holidays.filter(h => h.date?.startsWith(prefix))
    },

    // Show department dropdown only when visibility = DEPARTMENT
    showDeptDropdown() {
      return this.newEvent.visibility === 'DEPARTMENT'
    },
  },

  methods: {
    // ── FETCH ─────────────────────────────────────────────────────────────────


    async fetchEmployees() {

  try {

    const token =
      sessionStorage.getItem('hrms_token') ||
      localStorage.getItem('hrms_token')

    const res = await fetch(
      "http://localhost:3000/api/users/employees",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    console.log("EMPLOYEES:", data)

    this.employees = data.employees || []

  } catch (err) {

    console.error("Employees fetch failed:", err)

  }
},

    async fetchMonthData() {
      this.loading  = true
      this.errorMsg = ''
      try {
        const y    = this.currentYear
        const m    = String(this.currentMonth + 1).padStart(2, '0')
        const days = new Date(y, this.currentMonth + 1, 0).getDate()
        const from = `${y}-${m}-01`
        const to   = `${y}-${m}-${String(days).padStart(2, '0')}`

        const res     = await calendarAPI.getEvents({ from, to })
        this.events   = (res.data.events   || []).map(normalizeEvent)
        this.holidays = (res.data.holidays || []).map(normalizeHoliday)
      } catch (err) {
        this.errorMsg = err?.response?.data?.error || 'Failed to load calendar'
        console.error('[fetchMonthData]', err)
      } finally {
        this.loading = false
      }
    },

    async fetchDepartments() {
      try {
        const res        = await lookupAPI.getDepartments()
        this.departments = res.data?.departments || res.data || []
      } catch (err) {
        console.warn('[fetchDepartments]', err)
      }
    },

    async fetchNotifications() {
      this.notifLoading = true
      try {
        const res           = await calendarAPI.getNotifications()
        this.notifications  = res.data.notifications || []
        this.unreadCount    = res.data.unreadCount   || 0
      } catch (err) {
        console.warn('[fetchNotifications]', err)
      } finally {
        this.notifLoading = false
      }
    },

    // ── CREATE EVENT ──────────────────────────────────────────────────────────

    async addEvent() {
  this.errorMsg = ''

  // ── Validation ──────────────────────────────────────────────
  if (!this.newEvent.title || !this.newEvent.date) {
    this.errorMsg = 'Title and date are required'
    return
  }
  if (!this.newEvent.isAllDay && (!this.newEvent.startTime || !this.newEvent.endTime)) {
    this.errorMsg = 'Start time and end time are required'
    return
  }
  if (this.newEvent.visibility === 'DEPARTMENT' && !this.newEvent.departmentId) {
    this.errorMsg = 'Please select a department'
    return
  }
  if (this.newEvent.visibility === 'ASSIGN' && this.newEvent.attendeeIds.length === 0) {
    this.errorMsg = 'Please select at least one employee'
    return
  }

  this.saving = true

  try {
    const startISO = this.newEvent.isAllDay
      ? `${this.newEvent.date}T00:00:00`
      : `${this.newEvent.date}T${this.newEvent.startTime}:00`

    const endISO = this.newEvent.isAllDay
      ? `${this.newEvent.date}T23:59:59`
      : `${this.newEvent.date}T${this.newEvent.endTime}:00`

    let recurrenceRule = null
    if (this.newEvent.isRecurring && this.newEvent.recurrenceDays?.length) {
      recurrenceRule = `FREQ=WEEKLY;BYDAY=${this.newEvent.recurrenceDays.join(',')}`
    }

    // ── Build payload based on visibility ───────────────────
    const payload = {
      title:          this.newEvent.title,
      description:    this.newEvent.description   || null,
      eventType:      this.newEvent.type,
      startTime:      startISO,
      endTime:        endISO,
      isAllDay:       this.newEvent.isAllDay       || false,
      location:       this.newEvent.location       || null,
      meetLink:       this.newEvent.meetLink        || null,
      visibility:     this.newEvent.visibility,
      isRecurring:    this.newEvent.isRecurring    || false,
      recurrenceRule: recurrenceRule,
      recurrenceEnd:  this.newEvent.recurrenceEnd  || null,

      // ✅ Explicitly null/empty for non-matching visibility types
      departmentId:
        this.newEvent.visibility === 'DEPARTMENT'
          ? parseInt(this.newEvent.departmentId)
          : null,

      attendeeIds:
        this.newEvent.visibility === 'ASSIGN'
          ? [...new Set(this.newEvent.attendeeIds)]
          : [],
    }

    console.log('[addEvent] payload:', payload)

    const res = await calendarAPI.createEvent(payload)

    console.log('[addEvent] response:', res.data)

    // ✅ Close modal for ALL visibility types on success
    this.showAddModal = false
    this.selectedDay  = this.newEvent.date
    

    const notified = res.data.invited ?? res.data.notified ?? 0
    this.showSuccess(
      this.newEvent?.visibility === 'PUBLIC'
        ? 'Event created! All employees notified.'
        : `Event created! ${notified} employees notified.`
    )
    this.resetEventForm()

    await this.fetchMonthData()
    await this.fetchNotifications()

  } catch (err) {
    console.error('[addEvent] error:', err)
    console.error('[addEvent] response data:', err?.response?.data)

    // ❌ Keep modal OPEN on failure and show error
    this.errorMsg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      'Failed to create event. Check console for details.'
  } finally {
    this.saving = false
  }
},

    // ── CREATE HOLIDAY ────────────────────────────────────────────────────────

    async addHoliday() {
      this.holidayError = ''
      if (!this.newHoliday.name || !this.newHoliday.date) {
        this.holidayError = 'Name and date are required'
        return
      }
      this.holidaySaving = true
      try {
        const payload = {
          name:        this.newHoliday.name,
          date:        this.newHoliday.date,
          type:        this.newHoliday.type,
          stateCode:   this.newHoliday.stateCode   || null,
          description: this.newHoliday.description || null,
        }

        const res      = await calendarAPI.createHoliday(payload)
        const normalized = normalizeHoliday(res.data.holiday)
        this.holidays.push(normalized)
        this.showHolidayModal = false
        this.showSuccess('Holiday added successfully')
        this.resetHolidayForm()
      } catch (err) {
        this.holidayError = err?.response?.data?.error || 'Failed to add holiday'
        console.error('[addHoliday]', err)
      } finally {
        this.holidaySaving = false
      }
    },

    // ── DELETE EVENT ──────────────────────────────────────────────────────────

    async deleteEvent(id) {
      // Skip confirmation for holiday cells (they start with 'hol-')
      if (String(id).startsWith('hol-')) return
      if (!confirm('Cancel this event?')) return
      try {
        await calendarAPI.deleteEvent(id)
        this.events = this.events.filter(e => e.id !== id)
        if (this.selectedEvent?.id === id) this.selectedEvent = null
        this.showSuccess('Event cancelled')
      } catch (err) {
        this.errorMsg = err?.response?.data?.error || 'Failed to cancel event'
      }
    },

    // ── DELETE HOLIDAY ────────────────────────────────────────────────────────

    async deleteHoliday(id) {
      if (!confirm('Remove this holiday?')) return
      try {
        await calendarAPI.deleteHoliday(id)
        this.holidays = this.holidays.filter(h => h.id !== id)
        this.showSuccess('Holiday removed')
      } catch (err) {
        this.errorMsg = err?.response?.data?.error || 'Failed to remove holiday'
      }
    },

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

    async markRead(notifId) {
      try {
        await calendarAPI.markNotificationRead(notifId)
        this.notifications   = this.notifications.filter(n => n.id !== notifId)
        this.unreadCount     = Math.max(0, this.unreadCount - 1)
      } catch (err) {
        console.warn('[markRead]', err)
      }
    },

    async markAllRead() {
      try {
        await calendarAPI.markAllRead()
        this.notifications = []
        this.unreadCount   = 0
      } catch (err) {
        console.warn('[markAllRead]', err)
      }
    },

    toggleNotifPanel() {
      this.showNotifPanel = !this.showNotifPanel
      if (this.showNotifPanel) this.fetchNotifications()
    },

    // ── NAVIGATION ────────────────────────────────────────────────────────────

    prevMonth() {
      if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear-- }
      else this.currentMonth--
    },
    nextMonth() {
      if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++ }
      else this.currentMonth++
    },
    goToday() {
      this.currentYear  = this.today.getFullYear()
      this.currentMonth = this.today.getMonth()
      this.selectedDay  = this.todayStr
    },

    // ── HELPERS ───────────────────────────────────────────────────────────────

    // Build date string from local date components — never uses toISOString()
    formatDate(y, m, d) {
      const dt = new Date(y, m, d)
      return [
        dt.getFullYear(),
        String(dt.getMonth() + 1).padStart(2, '0'),
        String(dt.getDate()).padStart(2, '0'),
      ].join('-')
    },

    // Returns events + holidays for a given date cell
    cellEvents(date) {
      const evs = this.filteredEvents.filter(e => e.date === date)

      // Holidays shown as red cells
      const hols = this.holidays
        .filter(h => h.date === date)
        .map(h => ({
          id:          'hol-' + h.id,
          title:       h.name,
          color:       '#e05555',
          type:        'holiday',
          date:        h.date,
          time:        'All Day',
          location:    '—',
          departments: 'All Staff',
          desc:        h.type,
        }))

      return [...hols, ...evs]
    },

    openAddModal() {
      this.newEvent.date = this.selectedDay
      this.errorMsg      = ''
      this.showAddModal  = true
    },

    openHolidayModal() {
      this.newHoliday.date = this.selectedDay
      this.holidayError    = ''
      this.showHolidayModal = true
    },

    closeHolidayModal() {
      this.showHolidayModal = false
      this.holidayError     = ''
      this.resetHolidayForm()
    },

    resetEventForm() {
  this.newEvent = {
    title:          '',
    date:           '',
    startTime:      '',
    endTime:        '',
    type:           'MEETING',
    visibility:     'PUBLIC',
    departmentId:   '',
    location:       '',
    meetLink:       '',
    description:    '',
    isAllDay:       false,
    attendeeIds:    [],
    isRecurring:    false,      // ✅ added
    recurrenceDays: [],         // ✅ added
    recurrenceEnd:  '',         // ✅ added
  }
},

    resetHolidayForm() {
      this.newHoliday = { name: '', date: '', type: 'NATIONAL', stateCode: '', description: '' }
    },

    showSuccess(msg) {
      this.successMsg = msg
      setTimeout(() => { this.successMsg = '' }, 4000)
    },
    showError(msg) {
  this.errorMsg = msg
  setTimeout(() => { this.errorMsg = '' }, 5000)
},

    formatNotifTime(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
             ' · ' +
             d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    },
  },
}
</script>


<style scoped>
.cal-controls { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:14px; }
.month-nav { display:flex; align-items:center; gap:10px; }
.nav-btn { width:32px; height:32px; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .18s; }
.nav-btn:hover { background:var(--stone-ghost); }
.nav-btn svg { width:16px; height:16px; color:var(--text-2); }
.month-label { font-family:'Lora',serif; font-size:18px; font-weight:600; color:var(--text-1); min-width:180px; text-align:center; }
.today-btn { padding:6px 14px; background:var(--forest-ink); color:#fff; border:none; border-radius:var(--r-sm); font-size:12.5px; font-weight:600; cursor:pointer; }
.today-btn:hover { background:var(--forest-deep); }
.ctrl-right { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.view-tabs { display:flex; gap:3px; background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-sm); padding:3px; }
.vtab { padding:5px 14px; border-radius:var(--r-xs); border:none; background:transparent; font-size:12.5px; font-weight:500; color:var(--text-3); cursor:pointer; transition:all .18s; }
.vtab.active { background:var(--forest-ink); color:#fff; font-weight:600; }
.event-filters { display:flex; gap:6px; }
.etype-filter { font-size:11.5px; font-weight:600; padding:4px 12px; border-radius:20px; border:1px solid var(--border); background:var(--bg-card); color:var(--text-3); cursor:pointer; transition:all .18s; }
.etype-filter:hover { background:var(--stone-ghost); }

.cal-layout { display:grid; grid-template-columns:1fr 280px; gap:18px; }
.card { background:var(--bg-card); border:1px solid var(--border); border-radius:var(--r-lg); box-shadow:var(--shadow-xs); overflow:hidden; }
.card-hd { padding:20px 22px 14px; display:flex; align-items:flex-start; justify-content:space-between; }
.card-title { font-family:'Lora',serif; font-size:15px; font-weight:600; color:var(--text-1); }
.card-sub   { font-size:11.5px; color:var(--text-3); margin-top:2px; }
.card-link  { font-size:12px; font-weight:600; color:var(--forest); background:none; border:none; cursor:pointer; }

/* Month grid */
.month-view { }
.day-headers { display:grid; grid-template-columns:repeat(7,1fr); border-bottom:1px solid var(--border); }
.dh { padding:12px 0; text-align:center; font-size:11.5px; font-weight:700; color:var(--text-3); letter-spacing:.5px; text-transform:uppercase; }
.cal-grid { display:grid; grid-template-columns:repeat(7,1fr); }
.cal-cell { min-height:100px; padding:8px; border-right:1px solid var(--border); border-bottom:1px solid var(--border); cursor:pointer; transition:background .15s; }
.cal-cell:nth-child(7n) { border-right:none; }
.cal-cell.other-month { background:var(--stone-ghost); }
.cal-cell.today .cell-num { background:var(--forest-ink); color:#fff; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; }
.cal-cell.selected { background:var(--mint-ghost); }
.cal-cell:hover { background:var(--stone-ghost); }
.cal-cell.today.selected { background:var(--mint-ghost); }
.cell-num { font-size:12.5px; font-weight:600; color:var(--text-2); margin-bottom:4px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; }
.other-month .cell-num { color:var(--text-3); }
.cell-events { display:flex; flex-direction:column; gap:2px; }
.cell-ev { font-size:10.5px; font-weight:600; padding:2px 6px; border-radius:3px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cell-ev:hover { opacity:.85; }

/* List view */
.list-view { padding:0 0 8px; }
.ev-list-row { display:flex; align-items:center; gap:14px; padding:14px 22px; border-bottom:1px solid var(--border); cursor:pointer; transition:background .15s; }
.ev-list-row:last-child { border-bottom:none; }
.ev-list-row:hover { background:var(--stone-ghost); }
.ev-date-box { width:44px; height:50px; border-radius:var(--r-sm); display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
.evd { font-size:18px; font-weight:700; line-height:1; }
.evm { font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
.ev-body { flex:1; }
.ev-title { font-size:14px; font-weight:600; color:var(--text-1); margin-bottom:4px; }
.ev-meta  { display:flex; align-items:center; gap:5px; font-size:12px; color:var(--text-3); }
.ev-meta svg { width:12px; height:12px; }
.ev-tag { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; flex-shrink:0; }

/* Week placeholder */
.week-placeholder { min-height:400px; display:flex; align-items:center; justify-content:center; }
.wp-inner { text-align:center; }
.wp-icon  { font-size:48px; margin-bottom:12px; }
.wp-title { font-family:'Lora',serif; font-size:18px; font-weight:600; color:var(--text-1); margin-bottom:6px; }
.wp-sub   { font-size:13px; color:var(--text-3); }

/* Sidebar */
.cal-sidebar { display:flex; flex-direction:column; gap:14px; }
.sidebar-events { }
.add-sm-btn { width:28px; height:28px; border-radius:50%; background:var(--forest-ink); color:#fff; border:none; font-size:18px; line-height:1; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.sd-events { padding:0 22px 16px; display:flex; flex-direction:column; gap:8px; }
.no-events { text-align:center; padding:20px 0; }
.ne-ico { font-size:28px; margin-bottom:6px; }
.ne-txt { font-size:12px; color:var(--text-3); }
.sd-ev { display:flex; align-items:flex-start; gap:10px; background:var(--stone-ghost); border-radius:var(--r-sm); padding:10px; cursor:pointer; transition:all .18s; }
.sd-ev:hover { box-shadow:var(--shadow-sm); }
.sd-ev-bar { width:3px; height:auto; min-height:40px; border-radius:3px; flex-shrink:0; }
.sd-ev-body { flex:1; }
.sd-ev-title { font-size:12.5px; font-weight:600; color:var(--text-1); margin-bottom:2px; }
.sd-ev-meta  { font-size:11px; color:var(--text-3); margin-bottom:2px; }
.sd-ev-dept  { font-size:10.5px; color:var(--text-3); }
.sd-del { background:none; border:none; cursor:pointer; padding:2px; color:var(--text-3); }
.sd-del:hover { color:#a03020; }
.sd-del svg { width:13px; height:13px; }



.upcoming-list { padding:0 22px 16px; display:flex; flex-direction:column; gap:2px; }
.up-row { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); }
.up-row:last-child { border-bottom:none; }
.up-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.up-body { flex:1; }
.up-title { font-size:12.5px; font-weight:600; color:var(--text-1); }
.up-date  { font-size:11px; color:var(--text-3); margin-top:1px; }
.up-tag   { font-size:10px; font-weight:700; padding:2px 8px; border-radius:20px; flex-shrink:0; }

.hol-list { padding:0 22px 16px; display:flex; flex-direction:column; gap:4px; }
.hol-row { display:flex; align-items:center; gap:12px; padding:9px 0; border-bottom:1px solid var(--border); }
.hol-row:last-child { border-bottom:none; }
.hol-date { width:38px; height:40px; background:var(--mint-ghost); border-radius:var(--r-sm); display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
.hd-num { font-size:15px; font-weight:700; color:var(--forest-deep); line-height:1; }
.hd-mon { font-size:8px; font-weight:700; text-transform:uppercase; color:var(--forest); letter-spacing:.5px; }
.hol-name { font-size:12.5px; font-weight:600; color:var(--text-1); }
.hol-type { font-size:11px; color:var(--text-3); margin-top:1px; }

/* Event detail modal */
.ev-modal .ev-modal-hd { display:flex; align-items:flex-start; justify-content:space-between; padding:22px 24px; }
.ev-modal-type  { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; color:rgba(255,255,255,.7); margin-bottom:4px; }
.ev-modal-title { font-family:'Lora',serif; font-size:20px; font-weight:600; color:#fff; }
.modal-close.white { color:rgba(255,255,255,.8); background:rgba(255,255,255,.15); border-radius:50%; width:30px; height:30px; border:none; cursor:pointer; font-size:14px; }
.ev-modal-body { padding:22px 24px; }
.ev-detail-row { display:flex; align-items:center; gap:10px; margin-bottom:12px; font-size:13.5px; color:var(--text-2); }
.ev-detail-row svg { width:15px; height:15px; color:var(--text-3); flex-shrink:0; }
.ev-desc { font-size:13px; color:var(--text-3); line-height:1.6; margin-top:14px; padding-top:14px; border-top:1px solid var(--border); }

/* Modals */
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.4); z-index:500; display:flex; align-items:center; justify-content:center; }
.modal { background:var(--bg-card); border-radius:var(--r-lg); width:500px; max-width:95vw;  max-height: 90vh;        /* 👈 LIMIT HEIGHT */
  display: flex;
  flex-direction: column;  /* 👈 IMPORTANT */
  overflow: hidden; }
.modal-hd { display:flex; align-items:center; justify-content:space-between; padding:22px 24px 0; }
.modal-title { font-family:'Lora',serif; font-size:18px; font-weight:600; color:var(--text-1); }
.modal-close { background:none; border:none; font-size:16px; color:var(--text-3); cursor:pointer; width:30px; height:30px; border-radius:50%; }
.modal-close:hover { background:var(--stone-ghost); }
.modal-body { padding:24px; overflow-y:auto;flex:1}
.mform-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.mfield { margin-bottom:16px; }
.mfield label { display:block; font-size:12px; font-weight:600; color:var(--text-2); margin-bottom:6px; }
.mfield input, .mfield select { width:100%; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); padding:9px 13px; font-size:13px; font-family:inherit; color:var(--text-1); outline:none; }
.mfield input:focus, .mfield select:focus { border-color:var(--mint-mid); }
.modal-ft { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 22px; }
.btn-cancel { padding:9px 20px; border:1px solid var(--border); background:var(--bg-card); border-radius:var(--r-sm); font-size:13px; font-weight:600; color:var(--text-2); cursor:pointer; }
.btn-save { padding:9px 20px; background:var(--forest-ink); color:#fff; border:none; border-radius:var(--r-sm); font-size:13px; font-weight:600; cursor:pointer; }
.btn-save:hover { background:var(--forest-deep); }

@media (max-width: 1024px) {
  .cal-layout { grid-template-columns: 1fr; }
}

.selected-employee-box {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.selected-chip {
  background: #e8f5e9;
  color: #1b5e20;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.employee-select-list {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
}

.employee-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 4px;
  font-size: 14px;
}


@media (max-width: 768px) {
  .cal-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .month-nav,
  .ctrl-right {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .month-label {
    min-width: 0;
    font-size: 16px;
  }

  .event-filters {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .etype-filter {
    white-space: nowrap;
  }

  .cal-main {
    overflow-x: auto;
  }

  .month-view {
    min-width: 700px;
  }

  .list-view .ev-list-row {
    padding: 12px 14px;
    gap: 10px;
  }

  .card-hd,
  .sd-events,
  .upcoming-list,
  .hol-list {
    padding-left: 14px;
    padding-right: 14px;
  }

  .modal {
    width: 92vw;
  }

  .modal-body {
    padding: 16px;
  }

  .mform-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}


@media (max-width: 480px) {
  .view-tabs {
    width: 100%;
  }

  .vtab {
    flex: 1;
    text-align: center;
  }

  .today-btn {
    width: 100%;
  }

  .ev-tag,
  .up-tag {
    font-size: 9px;
    padding: 2px 6px;
  }
}

.assign-box{
  max-height:220px;
  overflow-y:auto;
  border:1px solid var(--border);
  border-radius:var(--r-sm);
  padding:10px;
  background:#fff;
}

.assign-item{
  display:flex;
  align-items:center;
  gap:10px;
  padding:8px 4px;
  border-bottom:1px solid #f1f1f1;
  font-size:13px;
  cursor:pointer;
}

.assign-item:last-child{
  border-bottom:none;
}

.assign-item input{
  width:16px;
  height:16px;
  cursor:pointer;
}
</style>
