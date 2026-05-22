<template>
  <UserLayout page-title="Notifications" page-sub="Stay updated with your HR activities." search-placeholder="Search notifications…" :unread-count="unreadCount">

    <!-- Header controls -->
    <div class="notif-top">
      <div class="nt-filters">
        <button v-for="f in filters" :key="f.key"
          class="nf-btn" :class="{ active: activeFilter === f.key }"
          @click="activeFilter = f.key">
          {{ f.label }}
          <span class="nf-cnt" v-if="f.count > 0">{{ f.count }}</span>
        </button>
      </div>
      <button class="mark-all-btn" @click="markAllRead" v-if="unreadCount > 0">
        Mark all as read
      </button>
    </div>

    <!-- Notifications list -->
    <div class="notif-layout">

      <!-- Main list -->
      <div class="notif-list">
        <template v-for="(group, gi) in groupedNotifications" :key="gi">
          <div class="notif-group-label">{{ group.label }}</div>
          <div v-for="n in group.items" :key="n.id"
            class="notif-card" :class="{ unread: !n.read }"
            @click="markRead(n.id)">
            <div class="nc-left">
              <div class="nc-icon" :class="'nc-' + n.category">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="n.icon"></svg>
              </div>
              <div v-if="!n.read" class="nc-unread-dot"></div>
            </div>
            <div class="nc-body">
              <div class="nc-title" :class="{ 'fw-bold': !n.read }">{{ n.title }}</div>
              <div class="nc-desc">{{ n.desc }}</div>
              <div class="nc-meta">
                <span class="nc-time">{{ n.time }}</span>
                <span class="nc-tag" :class="'nt-' + n.category">{{ n.categoryLabel }}</span>
              </div>
            </div>
            <div class="nc-actions">
              <button v-if="n.action" class="nca-btn" @click.stop="n.actionDone = true">
                {{ n.actionDone ? '✓ Done' : n.action }}
              </button>
              <button class="nca-dismiss" @click.stop="dismissNotif(n.id)" title="Dismiss">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-if="!groupedNotifications.length" class="notif-empty">
          <div class="ne-icon">🔔</div>
          <div class="ne-title">All caught up!</div>
          <div class="ne-sub">No notifications in this category.</div>
        </div>
      </div>

      <!-- Sidebar: summary -->
      <div class="notif-sidebar">
        <!-- Summary card -->
        <div class="card ns-card">
          <div class="ns-title">Summary</div>
          <div class="ns-stats">
            <div v-for="s in notifStats" :key="s.label" class="ns-stat">
              <div class="ns-val" :style="{ color: s.color }">{{ s.val }}</div>
              <div class="ns-lbl">{{ s.label }}</div>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="card ns-card">
          <div class="ns-title">Categories</div>
          <div class="cat-list">
            <div v-for="c in categories" :key="c.key" class="cat-row"
              :class="{ active: activeFilter === c.key }"
              @click="activeFilter = c.key">
              <div class="cat-icon" :class="'ci-' + c.key">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="c.icon"></svg>
              </div>
              <span class="cat-label">{{ c.label }}</span>
              <span class="cat-count" v-if="c.count > 0" :class="'cc-' + c.key">{{ c.count }}</span>
            </div>
          </div>
        </div>

        <!-- Quick settings -->
        <div class="card ns-card">
          <div class="ns-title">Preferences</div>
          <div class="pref-list">
            <div v-for="p in prefs" :key="p.label" class="pref-row">
              <div class="pref-info">
                <div class="pref-label">{{ p.label }}</div>
                <div class="pref-sub">{{ p.sub }}</div>
              </div>
              <div class="toggle" :class="{ on: p.enabled }" @click="p.enabled = !p.enabled">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </UserLayout>
</template>

<script>
import UserLayout from '../../components/UserLayout.vue'
import { calendarAPI } from '@/services/api'

// 🔥 Convert event → notification
function mapEventToNotification(ev) {

  const start = new Date(ev.startTime)

  return {

    id: ev.id,

    title: `New Event: ${ev.title}`,

    // ✅ FIXED
    desc:
      ev.visibility === 'PUBLIC'
        ? 'Company-wide event'
        : `${ev.department?.name} department event`,

    time: start.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata'
    }),

    category: 'system',

    categoryLabel:
      ev.visibility === 'PUBLIC'
        ? 'Public'
        : ev.department?.name || 'Department',

    read: false,

    action: 'View Event',

    actionDone: false,

    icon: '<rect x="3" y="4" width="18" height="18" rx="2"/>',
    date: getDateGroup(start),

    visibility: ev.visibility
  }
}

// 🔥 Group by date
function getDateGroup(date) {
  const today = new Date()
  const yest = new Date()
  yest.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'today'
  if (date.toDateString() === yest.toDateString()) return 'yesterday'
  return 'older'
}

export default {
  name: 'NotificationsView',
  components: { UserLayout },

  data() {
    return {
      activeFilter: 'all',

      // filters UI
      filters: [
        { key: 'all', label: 'All', count: 0 },
        { key: 'unread', label: 'Unread', count: 0 },
        { key: 'system', label: 'Calendar', count: 0 }
      ],

      // categories UI
      categories: [
        {
          key: 'system',
          label: 'Calendar',
          count: 0,
          icon: '<rect x="3" y="4" width="18" height="18" rx="2"/>'
        }
      ],

      prefs: [
        { label: 'Event Notifications', sub: 'New event alerts', enabled: true }
      ],

      notifications: [],
      loading: false,
      interval: null
    }
  },

  computed: {
    unreadCount() {
      return this.notifications.filter(n => !n.read).length
    },

    notifStats() {
      const total = this.notifications.length
      const unread = this.unreadCount
      const today = this.notifications.filter(n => n.date === 'today').length

      return [
        { val: total, label: 'Total', color: '#3d5240' },
        { val: unread, label: 'Unread', color: '#e05a4a' },
        { val: today, label: 'Today', color: '#657D65' }
      ]
    },

    filteredNotifications() {
      const f = this.activeFilter
      if (f === 'all') return this.notifications
      if (f === 'unread') return this.notifications.filter(n => !n.read)
      return this.notifications.filter(n => n.category === f)
    },

    groupedNotifications() {
      const groups = [
        { label: 'Today', key: 'today', items: [] },
        { label: 'Yesterday', key: 'yesterday', items: [] },
        { label: 'Earlier', key: 'older', items: [] }
      ]

      this.filteredNotifications.forEach(n => {
        const g = groups.find(g => g.key === n.date)
        if (g) g.items.push(n)
      })

      return groups.filter(g => g.items.length > 0)
    }
  },

  methods: {
    // 🔥 MAIN API CALL
    async fetchNotifications() {
      this.loading = true

      try {
        const today = new Date()
        const from = `${today.getFullYear()}-01-01`
        const to = `${today.getFullYear()}-12-31`

        const res = await calendarAPI.getEvents({ from, to })

        const events = res.data.events || []

        // 🔥 convert events → notifications
        this.notifications = events.map(mapEventToNotification)

        // update counts
        this.updateCounts()

      } catch (err) {
        console.error("Failed to load notifications", err)
      } finally {
        this.loading = false
      }
    },

    updateCounts() {
      const unread = this.unreadCount

      this.filters.find(f => f.key === 'unread').count = unread
      this.filters.find(f => f.key === 'system').count = this.notifications.length

      this.categories.find(c => c.key === 'system').count = this.notifications.length
    },

    markRead(id) {
      const n = this.notifications.find(n => n.id === id)
      if (n) {
        n.read = true

        // 👉 navigate to calendar
        this.$router.push('/calendar')
      }
    },

    markAllRead() {
      this.notifications.forEach(n => (n.read = true))
      this.updateCounts()
    },

    dismissNotif(id) {
      const i = this.notifications.findIndex(n => n.id === id)
      if (i !== -1) this.notifications.splice(i, 1)
      this.updateCounts()
    }
  },

  // ✅ LOAD + AUTO REFRESH
  mounted() {
    this.fetchNotifications()

    // 🔥 auto refresh every 30 sec
    this.interval = setInterval(() => {
      this.fetchNotifications()
    }, 30000)
  },

  beforeUnmount() {
    clearInterval(this.interval)
  }
}
</script>

<style scoped>
/* Top controls */
.notif-top {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
}
.nt-filters { display: flex; gap: 4px; flex-wrap: wrap; }
.nf-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 20px;
  border: 1px solid #e4e8e0; background: #fff;
  font-size: 12.5px; font-weight: 500; color: var(--stone);
  cursor: pointer; transition: all .18s; font-family: var(--font-sans);
}
.nf-btn:hover { background: #f0f5f0; color: var(--forest-dk); }
.nf-btn.active { background: var(--forest-dk); color: #09350a; border-color: var(--forest-dk); font-weight: 600; }
.nf-cnt {
  background: var(--peach); color: #7a3325;
  font-size: 10px; font-weight: 700; padding: 0 5px;
  border-radius: 10px; min-width: 16px; text-align: center;
}
.nf-btn.active .nf-cnt { background: rgba(255,255,255,.2); color: #fff; }

.mark-all-btn {
  font-size: 12.5px; font-weight: 600; color: var(--forest);
  background: none; border: none; cursor: pointer;
  font-family: var(--font-sans); padding: 4px 0;
}
.mark-all-btn:hover { color: var(--forest-dk); text-decoration: underline; }

/* Layout */
.notif-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }

/* Group label */
.notif-group-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;
  color: var(--stone); padding: 16px 0 8px; margin-top: 4px;
}
.notif-group-label:first-child { padding-top: 0; margin-top: 0; }

/* Notification cards */
.notif-card {
  display: flex; gap: 14px;
  background: #fff; border: 1px solid #e8ece4; border-radius: var(--r-lg);
  padding: 16px; margin-bottom: 8px; cursor: pointer;
  transition: all .18s;
}
.notif-card:hover { box-shadow: 0 4px 16px rgba(61,82,64,.07); transform: translateY(-1px); }
.notif-card.unread { border-left: 3px solid var(--forest); background: #fafdf9; }

.nc-left { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.nc-icon {
  width: 38px; height: 38px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.nc-icon svg { width: 16px; height: 16px; }
.nc-leave      { background: rgba(169,233,173,.3); color: var(--forest-dk); }
.nc-attendance { background: rgba(255,207,193,.4); color: #8a3525; }
.nc-payroll    { background: rgba(117,120,114,.12); color: var(--stone); }
.nc-system     { background: #eef0ff; color: #4a5a90; }
.nc-tasks      { background: #fef8ec; color: #8a6020; }

.nc-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #e05a4a; flex-shrink: 0; }

.nc-body { flex: 1; }
.nc-title { font-size: 13.5px; font-weight: 500; color: #1e261f; margin-bottom: 4px; }
.nc-title.fw-bold { font-weight: 700; }
.nc-desc  { font-size: 12.5px; color: var(--stone); line-height: 1.5; margin-bottom: 8px; }
.nc-meta  { display: flex; align-items: center; gap: 10px; }
.nc-time  { font-size: 11px; color: #b0b5ae; }
.nc-tag   { font-size: 10.5px; font-weight: 700; padding: 2px 9px; border-radius: 20px; }
.nt-leave      { background: rgba(169,233,173,.3); color: #2d5c32; }
.nt-attendance { background: rgba(255,207,193,.3); color: #8a3525; }
.nt-payroll    { background: #f0f0ee; color: var(--stone); }
.nt-system     { background: #eef0ff; color: #4a5a90; }
.nt-tasks      { background: #fef8ec; color: #8a6020; }

.nc-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
.nca-btn {
  white-space: nowrap; font-size: 11.5px; font-weight: 700;
  padding: 5px 12px; border-radius: 20px;
  background: var(--forest-dk); color: #fff; border: none;
  cursor: pointer; font-family: var(--font-sans); transition: background .18s;
}
.nca-btn:hover { background: var(--forest); }
.nca-dismiss {
  width: 26px; height: 26px; border-radius: 50%;
  background: none; border: 1px solid #e4e8e0;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s;
}
.nca-dismiss svg { width: 11px; height: 11px; color: #c0c5be; }
.nca-dismiss:hover { background: #fee; border-color: var(--peach); }
.nca-dismiss:hover svg { color: #e05a4a; }

/* Empty state */
.notif-empty { text-align: center; padding: 48px 24px; background: #fff; border-radius: var(--r-xl); border: 1px solid #e8ece4; }
.ne-icon  { font-size: 40px; display: block; margin-bottom: 12px; }
.ne-title { font-family: var(--font-serif); font-size: 18px; color: #4a5a4b; margin-bottom: 6px; }
.ne-sub   { font-size: 13px; color: var(--stone); }

/* Sidebar */
.notif-sidebar { display: flex; flex-direction: column; gap: 16px; }
.card { background: #fff; border-radius: var(--r-xl); padding: 20px; border: 1px solid #e8ece4; }
.ns-card { }
.ns-title { font-family: var(--font-serif); font-size: 15px; color: #1e261f; margin-bottom: 16px; }

.ns-stats { display: flex; gap: 0; }
.ns-stat { flex: 1; text-align: center; }
.ns-stat + .ns-stat { border-left: 1px solid #eef0ec; }
.ns-val { font-family: var(--font-serif); font-size: 22px; }
.ns-lbl { font-size: 11px; color: var(--stone); margin-top: 2px; }

/* Categories list */
.cat-list { display: flex; flex-direction: column; gap: 2px; }
.cat-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: var(--r-sm); cursor: pointer; transition: background .15s;
}
.cat-row:hover { background: #f5faf5; }
.cat-row.active { background: #f0f5f0; }
.cat-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cat-icon svg { width: 14px; height: 14px; }
.ci-leave      { background: rgba(169,233,173,.3); color: var(--forest-dk); }
.ci-attendance { background: rgba(255,207,193,.3); color: #8a3525; }
.ci-payroll    { background: #f0f0ee; color: var(--stone); }
.ci-system     { background: #eef0ff; color: #4a5a90; }
.ci-tasks      { background: #fef8ec; color: #8a6020; }
.cat-label { flex: 1; font-size: 13px; font-weight: 500; color: #3a4a3b; }
.cat-count { font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 20px; }
.cc-leave      { background: rgba(169,233,173,.3); color: #2d5c32; }
.cc-attendance { background: rgba(255,207,193,.3); color: #8a3525; }
.cc-payroll    { background: #f0f0ee; color: var(--stone); }
.cc-system     { background: #eef0ff; color: #4a5a90; }
.cc-tasks      { background: #fef8ec; color: #8a6020; }

/* Preferences */
.pref-list { display: flex; flex-direction: column; gap: 12px; }
.pref-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.pref-label { font-size: 12.5px; font-weight: 600; color: #1e261f; }
.pref-sub   { font-size: 11px; color: var(--stone); margin-top: 1px; }

.toggle {
  width: 38px; height: 21px; border-radius: 21px;
  background: #dde3da; flex-shrink: 0; cursor: pointer; position: relative;
  transition: background .2s;
}
.toggle.on { background: var(--forest); }
.toggle-knob {
  position: absolute; top: 2px; left: 2px;
  width: 17px; height: 17px; border-radius: 50%;
  background: #fff; transition: transform .2s;
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
}
.toggle.on .toggle-knob { transform: translateX(17px); }
</style>
