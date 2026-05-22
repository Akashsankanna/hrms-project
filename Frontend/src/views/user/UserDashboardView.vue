<template>
  <UserLayout page-title="Dashboard" page-sub="Dashboard" search-placeholder="Search insights…" :unread-count="3">
    <template #hero-left>
      <div class="user-hero-text">
        <p class="user-hero-date">{{ currentDate }}</p>
        <h2 class="user-hero-title">Good morning, {{ employeeName }} 👋</h2>
      </div>
    </template>

    <!-- Top row: Attendance + Quick Actions -->
    <div class="dash-top">

      <!-- Attendance Flow Card -->
      <div class="card att-card">
        <div class="card-head">
          <div>
            <div class="card-eyebrow">Monthly Presence</div>
            <div class="card-title">Attendance Flow</div>
          </div>
          <div class="att-status">
            <span class="status-dot"></span> Currently Clocked In
          </div>
        </div>

        <!-- Bar chart -->
        <div class="att-bars">
          <div v-for="b in bars" :key="b.day" class="att-col">
            <div class="att-bar-wrap">
              <div class="att-bar" :class="{ today: b.today }" :style="{ height: b.h + '%' }"></div>
            </div>
            <div class="att-day">{{ b.day }}</div>
          </div>
        </div>

        <!-- Stats -->
        <div class="att-stats">
          <div class="att-stat" v-for="s in attStats" :key="s.label">
            <div class="att-stat-val" :style="{ color: s.color }">{{ s.val }}</div>
            <div class="att-stat-lbl">{{ s.label }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card qa-card">
        <div class="qa-title">Quick Actions</div>
        <div class="qa-list">
          <div v-for="a in quickActions" :key="a.label" class="qa-item" @click="$router.push(a.route)">
            <div class="qa-icon" :class="a.cls">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="a.icon"></svg>
            </div>
            <span class="qa-label">{{ a.label }}</span>
            <svg class="qa-arr" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom row: Focus Tasks + Collaborators -->
    <div class="dash-bottom">

      <!-- Focus Tasks -->
      <div class="card tasks-card">
        <div class="card-head">
          <div class="card-title">Focus Tasks</div>
          <button class="card-link" @click="$router.push('/calendar')">View Calendar</button>
        </div>
        <div class="task-list">
          <div v-for="t in tasks" :key="t.id" class="task-row">
            <div class="task-date">
              <div class="td-day">{{ t.day }}</div>
              <div class="td-month">{{ t.month }}</div>
            </div>
            <div class="task-body">
              <div class="task-title">{{ t.title }}</div>
              <div class="task-desc">{{ t.desc }}</div>
              <span v-if="t.priority" class="task-priority" :class="'p-' + t.priority.toLowerCase().replace(' ', '-')">
                {{ t.priority }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Collaborators + Leave CTA -->
      <div class="right-col">
        <!-- Collaborators -->
        <div class="card collab-card">
          <div class="card-head">
            <div class="card-title">TETL Collaborators</div>
            <span class="collab-active">12 Active Now</span>
          </div>
          <div class="collab-grid">
            <div v-for="c in collaborators" :key="c.name" class="collab-item">
              <div class="collab-av" :style="{ background: c.color }">{{ c.initials }}</div>
              <div class="collab-name">{{ c.name }}</div>
              <div class="collab-role">{{ c.role }}</div>
              <div class="collab-status" :class="c.status === 'online' ? 'online' : 'away'">
                {{ c.statusText }}
              </div>
            </div>
            <div class="collab-find" @click="showFindPeer = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Find Peer
            </div>
          </div>
        </div>

        <!-- Leave CTA -->
        <div class="card leave-cta">
          <div class="lc-leaf">
            <svg viewBox="0 0 60 60" fill="none">
              <path d="M30 5C15 20 10 30 15 42c3 8 9 13 15 13s12-5 15-13c5-12 0-22-15-37z" fill="rgba(169,233,173,.15)"/>
              <path d="M30 10C20 24 18 34 23 43c2.5 6 6 9 7 9" stroke="rgba(169,233,173,.3)" stroke-width="2"/>
            </svg>
          </div>
          <div class="lc-tag">Upcoming Leave?</div>
          <div class="lc-desc">Plan your next break. You have <strong>14 days</strong> of paid leave remaining.</div>
          <button class="lc-btn" @click="$router.push('/leave')">Request Now</button>
        </div>
      </div>
    </div>

    <!-- Find peer modal placeholder -->
    <div class="modal-overlay" v-if="showFindPeer" @click.self="showFindPeer = false">
      <div class="modal">
        <div class="modal-hd">
          <span class="modal-title">Find a Peer</span>
          <button @click="showFindPeer = false" class="modal-close">✕</button>
        </div>
        <div class="peer-list">
          <div v-for="p in allPeers" :key="p.name" class="peer-row">
            <div class="peer-av" :style="{ background: p.color }">{{ p.initials }}</div>
            <div>
              <div class="peer-name">{{ p.name }}</div>
              <div class="peer-role">{{ p.role }}</div>
            </div>
            <div class="peer-dot" :class="p.online ? 'on' : 'off'"></div>
          </div>
        </div>
      </div>
    </div>

  </UserLayout>
</template>

<script>
import UserLayout from '../../components/UserLayout.vue'
export default {
  name: 'DashboardView',
  components: { UserLayout },
  data() {
    return {
      employeeName: 'Employee',
      currentDate: '',
      showFindPeer: false,
      bars: [
        { day: 'W1', h: 72,  today: false },
        { day: 'W2', h: 86,  today: false },
        { day: 'W3', h: 78,  today: false },
        { day: 'W4', h: 95,  today: false },
        { day: 'W5', h: 100, today: true  },
        { day: 'W6', h: 88,  today: false },
        { day: 'W7', h: 82,  today: false },
      ],
      attStats: [
        { val: '98%',  label: 'Consistency', color: '#657D65' },
        { val: '0',    label: 'Lates',        color: '#757872' },
        { val: '164h', label: 'Total Time',   color: '#3d5240' },
      ],
      quickActions: [
        { label: 'Payslip Download',    route: '/dashboard', cls: 'qa-green',  icon: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="13" y2="15"/>' },
        { label: 'Health Benefits',     route: '/dashboard', cls: 'qa-peach',  icon: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' },
        { label: 'TETL Academy',     route: '/dashboard', cls: 'qa-stone',  icon: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>' },
      ],
      tasks: [
        { id: 1, day: '12', month: 'OCT', title: 'Quarterly Performance Review', desc: 'Self-assessment and goal setting for Q4 with Sarah Miller.', priority: 'High Priority' },
        { id: 2, day: '15', month: 'OCT', title: 'Update Creative Portfolio',    desc: 'Upload recent atelier case studies to the central HR vault.', priority: null },
        { id: 3, day: '18', month: 'OCT', title: 'Team Workshop',               desc: 'Design thinking session in the Main Studio.', priority: null },
      ],
      collaborators: [
        { name: 'Anna May',  initials: 'AM', role: 'Lead Designer', status: 'online', statusText: 'Online', color: '#A9E9AD' },
        { name: 'Tom Klein', initials: 'TK', role: 'Developer',     status: 'online', statusText: 'Online', color: '#657D65' },
        { name: 'Lea Ross',  initials: 'LR', role: 'HR Manager',    status: 'away',   statusText: 'Away · 2:00 PM', color: '#FFCFC1' },
      ],
      allPeers: [
        { name: 'Anna May',    initials: 'AM', role: 'Lead Designer',  color: '#A9E9AD', online: true  },
        { name: 'Tom Klein',   initials: 'TK', role: 'Developer',      color: '#657D65', online: true  },
        { name: 'Lea Ross',    initials: 'LR', role: 'HR Manager',     color: '#FFCFC1', online: false },
        { name: 'Ravi Shah',   initials: 'RS', role: 'Finance Analyst',color: '#757872', online: true  },
        { name: 'Meera Jain',  initials: 'MJ', role: 'Marketing Exec.',color: '#3d5240', online: false },
      ],
    }
  },

  mounted() {
    // ✅ Get current date formatted like admin dashboard
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    this.currentDate = `${dayName}, ${date} ${monthName} ${year}`;

    // ✅ Get logged-in user's name
    const loggedInEmail = sessionStorage.getItem('loggedInUser');
    if (loggedInEmail) {
      const employees = JSON.parse(localStorage.getItem('hrms_employees')) || [];
      const user = employees.find(e => e.email && e.email.toLowerCase() === loggedInEmail.toLowerCase());
      if (user && user.name) {
        this.employeeName = user.name.split(' ')[0]; // Get first name
      }
    }
  }
}
</script>

<style scoped>
.user-hero-date { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 6px; letter-spacing: 0.04em; }
.user-hero-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: #fff; font-weight: 400; line-height: 1.1; }

/* Layout grids */
.dash-top    { display: grid; grid-template-columns: 1fr 290px; gap: 20px; margin-bottom: 20px; }
.dash-bottom { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }
.right-col   { display: flex; flex-direction: column; gap: 16px; }

/* Responsive Design */
@media (max-width: 1200px) {
  .dash-top    { grid-template-columns: 1fr 280px; gap: 16px; }
  .dash-bottom { grid-template-columns: 1fr 320px; gap: 16px; }
}

@media (max-width: 1024px) {
  .dash-top    { grid-template-columns: 1fr; gap: 16px; margin-bottom: 16px; }
  .dash-bottom { grid-template-columns: 1fr; gap: 16px; }
  .card { padding: 20px; }
  .card-title { font-size: 15px; }
}

@media (max-width: 768px) {
  .user-hero-title { font-size: 22px; }
  .dash-top    { grid-template-columns: 1fr; gap: 14px; margin-bottom: 14px; }
  .dash-bottom { grid-template-columns: 1fr; gap: 14px; }
  .card { padding: 16px; border-radius: var(--r-lg); }
  .card-head { margin-bottom: 16px; }
  .card-eyebrow { font-size: 9px; }
  .card-title { font-size: 14px; }
  .card-link { font-size: 11px; }
  
  .att-bars { height: 100px; gap: 6px; margin-bottom: 16px; }
  .att-stats { padding-top: 14px; }
  .att-stat-val { font-size: 18px; }
  
  .qa-list { gap: 8px; }
  .qa-item { padding: 12px; gap: 10px; }
  .qa-title { font-size: 15px; margin-bottom: 12px; }
  
  .task-row { gap: 12px; padding: 12px 0; }
  .task-date { width: 32px; }
  .td-day { font-size: 16px; }
  .task-title { font-size: 13px; }
  .task-desc { font-size: 12px; margin-bottom: 6px; }
  
  .collab-grid { grid-template-columns: repeat(2, 1fr); }
  .collab-av { width: 36px; height: 36px; font-size: 11px; margin: 0 auto 6px; }
  .collab-name { font-size: 11px; }
  .collab-role { font-size: 9px; }
  .collab-active { font-size: 10px; }
  
  .lc-tag { font-size: 15px; }
  .lc-desc { font-size: 14px; margin-bottom: 16px; }
  .lc-btn { padding: 8px 18px; font-size: 12px; }
}

@media (max-width: 600px) {
  .dash-top    { gap: 12px; margin-bottom: 12px; }
  .dash-bottom { gap: 12px; }
  .card { padding: 14px; }
  .card-head { margin-bottom: 12px; }
  .card-eyebrow { font-size: 8px; letter-spacing: 1px; }
  .card-title { font-size: 13px; }
  
  .att-bars { height: 80px; gap: 4px; margin-bottom: 12px; }
  .att-bar { border-radius: 6px 6px 3px 3px; min-height: 3px; }
  .att-day { font-size: 9px; }
  .att-stats { padding-top: 12px; }
  .att-stat-val { font-size: 16px; margin-bottom: 2px; }
  .att-stat-lbl { font-size: 10px; }
  
  .qa-list { gap: 8px; }
  .qa-item { padding: 10px; gap: 8px; border-radius: var(--r-sm); }
  .qa-icon { width: 32px; height: 32px; }
  .qa-icon svg { width: 14px; height: 14px; }
  .qa-label { font-size: 12px; }
  .qa-arr { width: 14px; height: 14px; }
  .qa-title { font-size: 14px; margin-bottom: 10px; }
  
  .task-row { gap: 10px; padding: 10px 0; }
  .task-date { width: 30px; }
  .td-day { font-size: 15px; }
  .td-month { font-size: 8px; }
  .task-title { font-size: 12px; margin-bottom: 3px; }
  .task-desc { font-size: 11px; margin-bottom: 5px; }
  .task-priority { font-size: 9px; padding: 2px 8px; }
  
  .collab-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .collab-item { padding: 10px 8px; }
  .collab-av { width: 34px; height: 34px; font-size: 10px; margin: 0 auto 5px; }
  .collab-name { font-size: 10px; }
  .collab-role { font-size: 8px; margin: 1px 0 4px; }
  .collab-status { font-size: 9px; }
  
  .lc-tag { font-size: 14px; margin-bottom: 6px; }
  .lc-desc { font-size: 13px; margin-bottom: 12px; }
  .lc-btn { padding: 8px 16px; font-size: 11px; }
  .lc-leaf { width: 60px; height: 60px; }
  
  .modal { width: 90vw; }
  .peer-av { width: 32px; height: 32px; font-size: 11px; }
  .peer-name { font-size: 12px; }
  .peer-role { font-size: 10px; }
}

@media (max-width: 480px) {
  .collab-grid { grid-template-columns: repeat(2, 1fr); gap: 6px; }
  .card { padding: 12px; }
  .card-title { font-size: 12px; }
  .card-eyebrow { font-size: 7px; }
  
  .att-bars { height: 70px; gap: 4px; margin-bottom: 10px; }
  .att-status { padding: 5px 10px; font-size: 11px; gap: 5px; }
  .status-dot { width: 6px; height: 6px; }
  
  .att-stats { padding-top: 10px; gap: 0; }
  .att-stat + .att-stat { border-left: 1px solid #eef0ec; }
  .att-stat-val { font-size: 14px; margin-bottom: 2px; }
  .att-stat-lbl { font-size: 9px; }
  
  .qa-list { gap: 6px; }
  .qa-item { padding: 10px; gap: 8px; border-radius: 8px; }
  .qa-icon { width: 30px; height: 30px; }
  .qa-icon svg { width: 12px; height: 12px; }
  .qa-label { font-size: 11px; }
  .qa-arr { width: 12px; height: 12px; }
  .qa-title { font-size: 12px; margin-bottom: 8px; }
  
  .task-row { gap: 8px; padding: 8px 0; }
  .task-date { width: 28px; }
  .td-day { font-size: 14px; }
  .td-month { font-size: 7px; }
  .task-title { font-size: 11px; margin-bottom: 2px; }
  .task-desc { font-size: 10px; margin-bottom: 4px; }
  .task-priority { font-size: 8px; padding: 1px 6px; }
  
  .card-head { margin-bottom: 10px; }
  .card-link { font-size: 10px; }
  
  .collab-item { padding: 8px 6px; }
  .collab-av { width: 32px; height: 32px; font-size: 10px; margin: 0 auto 4px; }
  .collab-name { font-size: 9px; }
  .collab-role { font-size: 7px; margin: 1px 0 3px; }
  .collab-status { font-size: 8px; }
  .collab-active { font-size: 9px; }
  .collab-find { padding: 10px 8px; font-size: 10px; gap: 4px; }
  .collab-find svg { width: 14px; height: 14px; }
  
  .lc-tag { font-size: 13px; margin-bottom: 4px; }
  .lc-desc { font-size: 12px; margin-bottom: 10px; }
  .lc-btn { padding: 7px 14px; font-size: 10px; }
  .lc-leaf { width: 50px; height: 50px; }
  
  .modal { width: 88vw; }
  .modal-hd { padding: 16px 18px; }
  .modal-title { font-size: 15px; }
  .modal-close { width: 24px; height: 24px; font-size: 13px; }
  .peer-av { width: 30px; height: 30px; font-size: 10px; }
  .peer-name { font-size: 11px; }
  .peer-role { font-size: 9px; }
  .peer-list { max-height: 280px; padding: 8px 0; }
  .peer-row { padding: 10px 16px; gap: 10px; }
}

/* Card base */
.card {
  background: #fff;
  border-radius: var(--r-xl);
  padding: 24px;
  border: 1px solid #e8ece4;
}
.card-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  margin-bottom: 20px;
}
.card-eyebrow { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--stone); margin-bottom: 4px; }
.card-title   { font-family: var(--font-serif); font-size: 17px; color: #1e261f; }
.card-link    { font-size: 12.5px; color: var(--forest); font-weight: 600; background: none; border: none; cursor: pointer; }
.card-link:hover { color: var(--forest-dk); }

/* Attendance */
.att-card { }
.att-status {
  display: flex; align-items: center; gap: 7px;
  background: #f5f5f0; border: 1px solid #e4e8e0; border-radius: 30px;
  padding: 6px 12px; font-size: 12px; font-weight: 500; color: var(--forest-dk);
  white-space: nowrap;
}
.status-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #4caf72;
  box-shadow: 0 0 0 3px rgba(76,175,114,.2);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(76,175,114,.2)} 50%{box-shadow:0 0 0 5px rgba(76,175,114,.1)} }

.att-bars {
  display: flex; align-items: flex-end; gap: 8px; height: 130px; margin-bottom: 20px;
}
.att-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
.att-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.att-bar {
  width: 100%; border-radius: 8px 8px 4px 4px;
  background: #e0ead0;
  transition: height .4s ease;
  min-height: 4px;
}
.att-bar.today { background: var(--forest-dk); }
.att-day { font-size: 10px; color: #a0a89e; font-weight: 500; }

.att-stats {
  display: flex;
  border-top: 1px solid #eef0ec;
  padding-top: 18px;
  gap: 0;
}
.att-stat { flex: 1; text-align: center; }
.att-stat + .att-stat { border-left: 1px solid #eef0ec; }
.att-stat-val { font-family: var(--font-serif); font-size: 22px; font-weight: 400; margin-bottom: 3px; }
.att-stat-lbl { font-size: 11px; color: var(--stone); }

/* Quick actions */
.qa-card { display: flex; flex-direction: column; }
.qa-title { font-family: var(--font-serif); font-size: 17px; color: #1e261f; margin-bottom: 18px; }
.qa-list  { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.qa-item  {
  display: flex; align-items: center; gap: 13px;
  background: #f8faf8; border: 1px solid #eef0ec;
  border-radius: var(--r-md); padding: 14px;
  cursor: pointer; transition: all .18s;
}
.qa-item:hover { border-color: var(--mint); box-shadow: 0 2px 10px rgba(61,82,64,.06); transform: translateX(2px); }
.qa-icon {
  width: 36px; height: 36px; border-radius: var(--r-sm);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.qa-icon svg { width: 16px; height: 16px; }
.qa-green { background: rgba(169,233,173,.3); color: var(--forest-dk); }
.qa-peach { background: rgba(255,207,193,.4); color: #8a3525; }
.qa-stone { background: rgba(117,120,114,.12); color: var(--stone); }
.qa-label { flex: 1; font-size: 13.5px; font-weight: 600; color: #1e261f; }
.qa-arr   { width: 16px; height: 16px; color: #c0c5be; }

/* Tasks */
.tasks-card { }
.task-list { display: flex; flex-direction: column; }
.task-row {
  display: flex; gap: 16px; padding: 16px 0;
  border-bottom: 1px solid #eef0ec;
}
.task-row:last-child { border-bottom: none; }
.task-date {
  width: 36px; flex-shrink: 0; text-align: center; padding-top: 2px;
}
.td-day   { font-family: var(--font-serif); font-size: 20px; color: #1e261f; line-height: 1; }
.td-month { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--stone); margin-top: 2px; }
.task-body { flex: 1; }
.task-title { font-size: 14px; font-weight: 600; color: #1e261f; margin-bottom: 4px; }
.task-desc  { font-size: 12.5px; color: var(--stone); line-height: 1.5; margin-bottom: 8px; }
.task-priority {
  font-size: 10.5px; font-weight: 700; padding: 3px 10px;
  border-radius: 20px; display: inline-block;
}
.p-high-priority { background: rgba(255,207,193,.5); color: #8a3525; }

/* Collaborators */
.collab-card { }
.collab-active { font-size: 11.5px; color: var(--forest); font-weight: 600; }
.collab-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
.collab-item {
  background: #f8faf8; border: 1px solid #eef0ec;
  border-radius: var(--r-md); padding: 12px 10px; text-align: center;
}
.collab-av {
  width: 40px; height: 40px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: var(--forest-dk);
  margin: 0 auto 8px;
}
.collab-name   { font-size: 12px; font-weight: 600; color: #1e261f; }
.collab-role   { font-size: 10px; text-transform: uppercase; letter-spacing: .8px; color: var(--stone); margin: 2px 0 5px; }
.collab-status { font-size: 10.5px; font-weight: 500; }
.collab-status.online { color: #4caf72; }
.collab-status.away   { color: #a09890; }

.collab-find {
  background: #f8faf8; border: 1.5px dashed #c8d0c4;
  border-radius: var(--r-md); padding: 12px 10px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--stone); font-weight: 600; cursor: pointer;
  transition: all .18s;
}
.collab-find:hover { border-color: var(--forest); color: var(--forest-dk); background: #f0f5f0; }
.collab-find svg { width: 16px; height: 16px; }

/* Leave CTA */
.leave-cta {
  background: var(--forest-dk) !important;
  position: relative; overflow: hidden;
}
.lc-leaf {
  position: absolute; right: -10px; bottom: -10px; width: 80px; height: 80px;
  opacity: .6;
}
.lc-leaf svg { width: 100%; height: 100%; }
.lc-tag  { font-size: 16px; font-family: var(--font-serif); color:#2e7d32; margin-bottom: 8px; }
.lc-desc { font-size: 16px; color:#2e7d32; line-height: 1.6; margin-bottom: 20px; }
.lc-desc strong { color: var(--mint); font-weight: 600; }
.lc-btn {
  background: #fff; color: var(--forest-dk);
  border: none; border-radius: 30px;
  padding: 9px 22px; font-size: 13px; font-weight: 700;
  cursor: pointer; font-family: var(--font-sans);
  transition: background .18s;
  position: relative; z-index: 1;
}
.lc-btn:hover { background: var(--mint); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  z-index: 500; display: flex; align-items: center; justify-content: center;
}
.modal {
  background: #fff; border-radius: var(--r-xl); width: 380px; max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
}
.modal-hd {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #eef0ec;
}
.modal-title { font-family: var(--font-serif); font-size: 17px; color: #1e261f; }
.modal-close { background: none; border: none; font-size: 15px; color: var(--stone); cursor: pointer; width: 28px; height: 28px; border-radius: 50%; }
.modal-close:hover { background: #f0f5f0; }

.peer-list { padding: 12px 0; max-height: 320px; overflow-y: auto; }
.peer-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 24px; cursor: pointer; transition: background .15s;
}
.peer-row:hover { background: #f5faf5; }
.peer-av {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--forest-dk); flex-shrink: 0;
}
.peer-name { font-size: 13px; font-weight: 600; color: #1e261f; }
.peer-role { font-size: 11px; color: var(--stone); }
.peer-dot  { width: 8px; height: 8px; border-radius: 50%; margin-left: auto; flex-shrink: 0; }
.peer-dot.on  { background: #4caf72; }
.peer-dot.off { background: #d0d4ce; }

:root {
  --forest-ink: #1f3d2b;
  --forest: #2e7d32;
  --forest-deep: #1b5e20;

  --mint: #a9e9ad;
  --mint-mid: #86d98b;

  --bg-main: #f6fbf7;
  --bg-card: #ffffff;

  --text-1: #1a2e1a;
  --text-2: #3d5240;
  --text-3: #6b7d6f;

  --border: #e2eee5;
}
</style>
