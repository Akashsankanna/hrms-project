<template>
  <AdminLayout page-title="Dashboard" :show-add="false">
   
    
    <div class="content-body">

        <!-- KPI STATS ROW -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap green">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Total Employees</p>
              <h3 class="stat-value">{{ totalEmployees }}</h3>
              <p class="stat-change positive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                +12 this month
              </p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Present Today</p>
              <h3 class="stat-value">55</h3>
              <p class="stat-change positive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                76.5% attendance
              </p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap orange">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Pending Leaves</p>
              <h3 class="stat-value">7</h3>
              <p class="stat-change negative">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                +3 since yesterday
              </p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
            </div>
            <div class="stat-info">
              <p class="stat-label">Active Projects</p>
              <h3 class="stat-value">10</h3>
              <p class="stat-change positive">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                4 completing soon
              </p>
            </div>
          </div>
        </div>

        <!-- MIDDLE ROW -->
        <div class="mid-grid">

          <!-- ATTENDANCE CHART CARD -->
          <div class="card chart-card">
            <div class="card-head">
              <div>
                <h3 class="card-title">Attendance Overview</h3>
                <p class="card-sub">Weekly attendance rate</p>
              </div>
              <div class="card-head-right">
                <div class="toggle-tabs">
                  <button :class="['tab-btn', attView === 'week' && 'active']" @click="attView = 'week'">Week</button>
                  <button :class="['tab-btn', attView === 'month' && 'active']" @click="attView = 'month'">Month</button>
                </div>
              </div>
            </div>
            <div class="chart-area">
              <div class="bar-chart">
                <div v-for="(day, i) in attData" :key="i" class="bar-col">
                  <div class="bar-track">
                    <div class="bar-absent" :style="{ height: (100 - day.pct) + '%' }"></div>
                    <div class="bar-fill" :style="{ height: day.pct + '%' }">
                      <span class="bar-tip">{{ day.pct }}%</span>
                    </div>
                  </div>
                  <span class="bar-label">{{ day.label }}</span>
                </div>
              </div>
              <div class="chart-legend">
                <span class="legend-dot present"></span><span>Present</span>
                <span class="legend-dot absent"></span><span>Absent</span>
              </div>
            </div>
          </div>

          <!-- DEPT DISTRIBUTION -->
          <div class="card dept-card">
            <div class="card-head">
              <div>
                <h3 class="card-title">Department Distribution</h3>
                <p class="card-sub">Headcount by department</p>
              </div>
            </div>
            <div class="dept-list">
              <div v-for="dept in deptData" :key="dept.name" class="dept-row">
                <div class="dept-row-left">
                  <div class="dept-dot" :style="{ background: dept.color }"></div>
                  <span class="dept-name">{{ dept.name }}</span>
                </div>
                <div class="dept-row-right">
                  <div class="dept-bar-bg">
                    <div class="dept-bar-fill" :style="{ width: dept.pct + '%', background: dept.color }"></div>
                  </div>
                  <span class="dept-count">{{ dept.count }}</span>
                </div>
              </div>
            </div>
            <div class="dept-total">
              <span>Total Headcount</span>
              <strong>60</strong>
            </div>
          </div>

        </div>

        <!-- BOTTOM ROW -->
        <div class="bottom-grid">

          <!-- RECENT EMPLOYEES -->
          <div class="card table-card">
            <div class="card-head">
              <div>
                <h3 class="card-title">Recent Employees</h3>
                <p class="card-sub">Latest additions to the team</p>
              </div>
              <router-link to="/employees" class="card-link">View All →</router-link>
            </div>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Join Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="emp in recentEmployees" :key="emp.id">
                  <td>
                    <div class="emp-cell">
                      <div class="emp-avatar" :style="{ background: emp.color }">{{ emp.initials }}</div>
                      <div>
                        <p class="emp-name">{{ emp.name }}</p>
                        <p class="emp-email">{{ emp.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td><span class="dept-tag">{{ emp.dept }}</span></td>
                  <td class="role-cell">{{ emp.role }}</td>
                  <td class="date-cell">{{ emp.date }}</td>
                  <td><span :class="['status-badge', emp.status === 'Active' ? 'active' : 'inactive']">{{ emp.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="right-col">

            <!-- PENDING LEAVES -->
            <div class="card leave-card">
              <div class="card-head">
                <div>
                  <h3 class="card-title">Leave Requests</h3>
                  <p class="card-sub">Awaiting approval</p>
                </div>
                <span class="badge-count">{{ pendingLeaves.length }}</span>
              </div>
              <div class="leave-list">
                <div v-for="req in pendingLeaves" :key="req.id" class="leave-item">
                  <div class="leave-avatar" :style="{ background: req.color }">{{ req.initials }}</div>
                  <div class="leave-info">
                    <p class="leave-name">{{ req.name }}</p>
                    <p class="leave-date">{{ req.dates }} · {{ req.days }} day{{ req.days > 1 ? 's' : '' }}</p>
                  </div>
                  <div class="leave-actions">
                    <button class="approve-btn">✓</button>
                    <button class="reject-btn">✕</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- UPCOMING MEETINGS -->
            <div class="card meeting-card">
              <div class="card-head">
                <div>
                  <h3 class="card-title">Upcoming Meetings</h3>
                  <p class="card-sub">Today & Tomorrow</p>
                </div>
              </div>
              <div class="meeting-list">
                <div v-for="meet in meetings" :key="meet.id" class="meeting-item">
                  <div class="meeting-time-col">
                    <span class="meet-time">{{ meet.time }}</span>
                    <span class="meet-duration">{{ meet.duration }}</span>
                  </div>
                  <div class="meet-line" :style="{ background: meet.color }"></div>
                  <div class="meet-info">
                    <p class="meet-title">{{ meet.title }}</p>
                    <p class="meet-participants">{{ meet.participants }} participants</p>
                  </div>
                  <span :class="['meet-tag', meet.type]">{{ meet.type }}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ACTIVITY LOG -->
        <div class="card activity-card">
          <div class="card-head">
            <div>
              <h3 class="card-title">Recent Activities</h3>
              <p class="card-sub">System activity log</p>
            </div>
            <button class="card-link">Clear All</button>
          </div>
          <div class="activity-list">
            <div v-for="act in activities" :key="act.id" class="activity-item">
              <div class="act-icon-wrap" :style="{ background: act.bg }">
                <svg v-if="act.type === 'employee'" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="act.color" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <svg v-if="act.type === 'leave'" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="act.color" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <svg v-if="act.type === 'meeting'" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="act.color" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                <svg v-if="act.type === 'project'" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="act.color" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
              </div>
              <div class="act-info">
                <p class="act-text">{{ act.text }}</p>
                <p class="act-time">{{ act.time }}</p>
              </div>
              <span class="act-tag" :style="{ color: act.color, background: act.bg }">{{ act.label }}</span>
            </div>
          </div>
        </div>
      </div>

  </AdminLayout>
</template>

<script>
import AdminLayout from '../components/AdminLayout.vue'

export default {
  name: 'DashboardPage',
  components: { AdminLayout },

  data() {
    return {
      attView: 'week',
      attData: [
        { label: 'Mon', pct: 88 },
        { label: 'Tue', pct: 92 },
        { label: 'Wed', pct: 79 },
        { label: 'Thu', pct: 85 },
        { label: 'Fri', pct: 76 },
        { label: 'Sat', pct: 42 },
        { label: 'Sun', pct: 18 },
      ],

      deptData: [
        { name: 'Engineering', count: 72, pct: 82, color: '#2e7d32' },
        { name: 'Design', count: 28, pct: 32, color: '#1565c0' },
        { name: 'Marketing', count: 35, pct: 40, color: '#e65100' },
        { name: 'Finance', count: 22, pct: 25, color: '#6a1b9a' },
        { name: 'HR', count: 18, pct: 20, color: '#00838f' },
        { name: 'Operations', count: 45, pct: 51, color: '#f57f17' },
        { name: 'Sales', count: 27, pct: 30, color: '#ad1457' },
      ],

      recentEmployees: [],
      pendingLeaves: [
        { id: 1, initials: 'RS', name: 'Nikita Yaldandi', dates: 'Mar 28–30', days: 3, color: '#2e7d32' },
        { id: 2, initials: 'PM', name: 'Vaishnavi Sherala', dates: 'Apr 1', days: 1, color: '#1565c0' },
        { id: 3, initials: 'AJ', name: 'Basid Tagala', dates: 'Apr 3–7', days: 5, color: '#e65100' },
      ],

      meetings: [
        { id: 1, time: '10:00 AM', duration: '45 min', title: 'Q1 Performance Review', participants: 12, type: 'today', color: '#2e7d32' },
        { id: 2, time: '02:30 PM', duration: '30 min', title: 'Product Roadmap Sync', participants: 8, type: 'today', color: '#1565c0' },
        { id: 3, time: '11:00 AM', duration: '60 min', title: 'New Hire Orientation', participants: 5, type: 'tomorrow', color: '#e65100' },
      ],

      activities: [
        { id: 1, type: 'employee', text: 'New employee Ravi Sharma was onboarded.', time: '2 min ago', label: 'New Hire', color: '#2e7d32', bg: '#e8f5e9' },
      ],

      showAddForm: false,

      newEmployeeForm: {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      },

      employees: []
    }
  },

  computed: {
    currentDate() {
      return new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    timeOfDay() {
      const h = new Date().getHours()
      if (h < 12) return 'Morning'
      if (h < 17) return 'Afternoon'
      return 'Evening'
    },

    totalEmployees() {
      return this.employees.length
    }
  },

  mounted() {
    this.loadEmployees();
    this.resetForm();
  },

  methods: {

    closeAddForm() {
      this.showAddForm = false;
      this.resetForm();
    },

    resetForm() {
      this.newEmployeeForm = {
        firstName: '',
        lastName: '',
        email: '',
        password: ''
      };
    },

    // ✅ SAFE LOAD
    loadEmployees() {
      const data = JSON.parse(localStorage.getItem('hrms_employees')) || [];
      this.employees = data;
      this.updateRecentEmployees();
    },

    // ✅ SAFE INITIALS FIX (NO CRASH)
    updateRecentEmployees() {
      const recent = this.employees.slice(-7).reverse();

      this.recentEmployees = recent.map(emp => ({
        ...emp,
        name: (emp.firstName || '') + ' ' + (emp.lastName || ''),
        initials: ((emp.firstName?.[0] || '') + (emp.lastName?.[0] || '')).toUpperCase()
      }));
    },

    // ✅ FIXED ADD EMPLOYEE
    addEmployee() {

      if (
        !this.newEmployeeForm.firstName ||
        !this.newEmployeeForm.lastName ||
        !this.newEmployeeForm.email ||
        !this.newEmployeeForm.password
      ) {
        alert('Please fill all fields');
        return;
      }

      // ✅ FIXED KEY
      const employees = JSON.parse(localStorage.getItem('hrms_employees')) || [];

      const newEmp = {
        id: Date.now(),
        firstName: this.newEmployeeForm.firstName.trim(),
        lastName: this.newEmployeeForm.lastName.trim(),
        email: this.newEmployeeForm.email.trim(),
        password: this.newEmployeeForm.password,
        isFirstLogin: true,
        dept: 'HR',
        role: 'New Hire',
        date: new Date().toLocaleDateString(),
        status: 'Active',
        color: '#2e7d32'
      };

      employees.push(newEmp);

      // ✅ FIXED SAVE
      localStorage.setItem('hrms_employees', JSON.stringify(employees));

      this.loadEmployees();
      this.closeAddForm();
    }
  }
}
</script>
<style scoped>
/* ─── CONTENT BODY ─────────────────────────── */
.content-body { padding: 0; display: flex; flex-direction: column; gap: 20px; }

/* ─── GREETING (used inside layout hero) ───────────────── */
.greeting-date { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 4px; letter-spacing: 0.05em; }
.greeting-title { font-family: 'DM Serif Display', serif; font-size: 28px; color: #fff; font-weight: 400; margin-bottom: 6px; }
.greeting-sub { font-size: 13.5px; color: rgba(255,255,255,0.6); }
.greeting-actions { display: flex; gap: 12px; z-index: 1; }
.btn-primary {
  display: flex; align-items: center; gap: 8px;
  height: 42px; padding: 0 20px;
  background: #fff; color: #1a2e1a;
  border: none; border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px; font-weight: 600;
  cursor: pointer; transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.92; }
.btn-outline {
  height: 42px; padding: 0 20px;
  background: transparent; color: rgba(255,255,255,0.85);
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px; font-weight: 500;
  cursor: pointer; transition: background 0.2s;
}
.btn-outline:hover { background: rgba(255,255,255,0.08); }

/* ─── STATS GRID ─────────────────────────── */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.stat-card {
  background: #fff; border-radius: 16px;
  padding: 22px; display: flex; gap: 16px;
  align-items: center;
  border: 1px solid #e8f0e8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
.stat-icon-wrap {
  width: 50px; height: 50px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-icon-wrap.green { background: #e8f5e9; color: #2e7d32; }
.stat-icon-wrap.blue { background: #e3f2fd; color: #1565c0; }
.stat-icon-wrap.orange { background: #fff3e0; color: #e65100; }
.stat-icon-wrap.purple { background: #f3e5f5; color: #6a1b9a; }
.stat-info {}
.stat-label { font-size: 12px; color: #8aaa8a; font-weight: 500; margin-bottom: 4px; }
.stat-value { font-family: 'DM Serif Display', serif; font-size: 32px; color: #1a2e1a; line-height: 1; margin-bottom: 6px; }
.stat-change { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 500; }
.stat-change.positive { color: #2e7d32; }
.stat-change.negative { color: #e65100; }

/* ─── CARD BASE ─────────────────────────── */
.card {
  background: #fff; border-radius: 18px;
  border: 1px solid #e8f0e8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.card-head {
  display: flex; align-items: flex-start;
  justify-content: space-between;
  padding: 20px 22px 0;
}
.card-title { font-size: 15px; font-weight: 700; color: #1a2e1a; margin-bottom: 2px; }
.card-sub { font-size: 12px; color: #8aaa8a; }
.card-link { font-size: 12.5px; color: #2e7d32; font-weight: 600; text-decoration: none; cursor: pointer; background: none; border: none; }
.card-link:hover { text-decoration: underline; }
.card-head-right { display: flex; align-items: center; gap: 10px; }

/* ─── TOGGLE TABS ─────────────────────────── */
.toggle-tabs {
  display: flex; background: #f0f7f0;
  border-radius: 8px; padding: 3px;
}
.tab-btn {
  padding: 5px 14px; border-radius: 6px;
  border: none; background: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 500;
  color: #8aaa8a; cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active { background: #fff; color: #2e7d32; font-weight: 600; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

/* ─── MID GRID ─────────────────────────── */
.mid-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; }

/* ─── BAR CHART ─────────────────────────── */
.chart-area { padding: 20px 22px; }
.bar-chart {
  display: flex; align-items: flex-end;
  gap: 8px; height: 160px; margin-bottom: 12px;
}
.bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; }
.bar-track {
  flex: 1; width: 100%; max-width: 36px;
  border-radius: 8px 8px 0 0;
  overflow: hidden; display: flex;
  flex-direction: column; background: #f0f7f0;
  position: relative;
}
.bar-absent { background: #f0f7f0; }
.bar-fill {
  background: linear-gradient(180deg, #43a047, #2e7d32);
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: height 0.6s cubic-bezier(.4,0,.2,1);
}
.bar-tip {
  position: absolute; top: -22px; left: 50%;
  transform: translateX(-50%);
  font-size: 10px; font-weight: 700;
  color: #2e7d32; white-space: nowrap;
  opacity: 0; transition: opacity 0.2s;
}
.bar-col:hover .bar-tip { opacity: 1; }
.bar-label { font-size: 11px; color: #8aaa8a; font-weight: 500; }
.chart-legend { display: flex; gap: 16px; align-items: center; font-size: 12px; color: #6a8a6a; }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; margin-right: 4px; }
.legend-dot.present { background: #2e7d32; }
.legend-dot.absent { background: #f0f7f0; border: 1.5px solid #dce8dc; }

/* ─── DEPT CARD ─────────────────────────── */
.dept-list { padding: 16px 22px; display: flex; flex-direction: column; gap: 12px; }
.dept-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dept-row-left { display: flex; align-items: center; gap: 8px; min-width: 110px; }
.dept-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.dept-name { font-size: 12.5px; color: #2a4a2a; font-weight: 500; }
.dept-row-right { display: flex; align-items: center; gap: 8px; flex: 1; }
.dept-bar-bg { flex: 1; height: 6px; background: #f0f7f0; border-radius: 10px; overflow: hidden; }
.dept-bar-fill { height: 100%; border-radius: 10px; transition: width 0.5s; }
.dept-count { font-size: 12px; font-weight: 700; color: #1a2e1a; min-width: 24px; text-align: right; }
.dept-total {
  display: flex; justify-content: space-between;
  padding: 12px 22px 18px;
  border-top: 1px solid #f0f7f0;
  font-size: 12.5px; color: #8aaa8a;
}
.dept-total strong { color: #1a2e1a; font-size: 14px; }

/* ─── BOTTOM GRID ─────────────────────────── */
.bottom-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; }
.right-col { display: flex; flex-direction: column; gap: 16px; }

/* ─── DATA TABLE ─────────────────────────── */
.table-card { overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table thead tr { background: #f8fcf8; }
.data-table th {
  padding: 10px 16px; text-align: left;
  font-size: 11px; font-weight: 700;
  color: #6a8a6a; letter-spacing: 0.06em;
  border-bottom: 1px solid #edf4ed;
}
.data-table th:first-child { padding-left: 22px; }
.data-table th:last-child { padding-right: 22px; }
.data-table tbody tr { border-bottom: 1px solid #f4faf4; transition: background 0.15s; }
.data-table tbody tr:hover { background: #fafcfa; }
.data-table tbody tr:last-child { border-bottom: none; }
.data-table td { padding: 12px 16px; }
.data-table td:first-child { padding-left: 22px; }
.data-table td:last-child { padding-right: 22px; }
.emp-cell { display: flex; align-items: center; gap: 10px; }
.emp-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.emp-name { font-size: 13.5px; font-weight: 600; color: #1a2e1a; }
.emp-email { font-size: 11px; color: #8aaa8a; }
.dept-tag {
  background: #f0f7f0; color: #2e7d32;
  font-size: 11px; font-weight: 600;
  padding: 3px 10px; border-radius: 20px;
}
.role-cell { font-size: 13px; color: #4a6a4a; }
.date-cell { font-size: 12px; color: #8aaa8a; }
.status-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.status-badge.active { background: #e8f5e9; color: #2e7d32; }
.status-badge.inactive { background: #fbe9e7; color: #bf360c; }

/* ─── LEAVE CARD ─────────────────────────── */
.leave-card {}
.badge-count {
  background: #ef5350; color: #fff;
  font-size: 11px; font-weight: 700;
  padding: 2px 8px; border-radius: 20px;
}
.leave-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.leave-item { display: flex; align-items: center; gap: 10px; padding: 10px 6px; border-radius: 10px; }
.leave-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.leave-info { flex: 1; }
.leave-name { font-size: 13px; font-weight: 600; color: #1a2e1a; }
.leave-date { font-size: 11.5px; color: #8aaa8a; }
.leave-actions { display: flex; gap: 6px; }
.approve-btn, .reject-btn {
  width: 30px; height: 30px; border-radius: 8px;
  border: none; cursor: pointer;
  font-size: 14px; display: flex; align-items: center; justify-content: center;
  transition: opacity 0.2s;
}
.approve-btn { background: #e8f5e9; color: #2e7d32; }
.reject-btn { background: #fbe9e7; color: #c62828; }
.approve-btn:hover, .reject-btn:hover { opacity: 0.8; }

/* ─── MEETING CARD ─────────────────────────── */
.meeting-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.meeting-item { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 10px; background: #fafcfa; }
.meeting-time-col { min-width: 62px; text-align: right; }
.meet-time { display: block; font-size: 12px; font-weight: 700; color: #1a2e1a; }
.meet-duration { display: block; font-size: 10px; color: #8aaa8a; }
.meet-line { width: 3px; height: 36px; border-radius: 2px; flex-shrink: 0; }
.meet-info { flex: 1; }
.meet-title { font-size: 13px; font-weight: 600; color: #1a2e1a; margin-bottom: 2px; }
.meet-participants { font-size: 11px; color: #8aaa8a; }
.meet-tag { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; text-transform: capitalize; }
.meet-tag.today { background: #e8f5e9; color: #2e7d32; }
.meet-tag.tomorrow { background: #fff3e0; color: #e65100; }

/* ─── ACTIVITY CARD ─────────────────────────── */
.activity-list { padding: 8px 22px 18px; display: flex; flex-direction: column; gap: 0; }
.activity-item {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f7f0;
}
.activity-item:last-child { border-bottom: none; }
.act-icon-wrap {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.act-info { flex: 1; }
.act-text { font-size: 13px; color: #2a4a2a; line-height: 1.4; }
.act-time { font-size: 11px; color: #8aaa8a; margin-top: 2px; }
.act-tag { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }

/* ─── MODAL STYLES ─────────────────────────── */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(26, 46, 26, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}
.modal-content {
  background: #fff;
  border-radius: 18px;
  width: 90vw;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: slideUp 0.25s cubic-bezier(0.25,0.46,0.45,0.94);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 24px 0;
  margin-bottom: 4px;
}
.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1a2e1a;
  font-family: 'DM Sans', sans-serif;
}
.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #8aaa8a;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -4px -8px -4px 0;
}
.modal-close:hover {
  background: #f0f7f0;
  color: #4a6a4a;
}
form {
  padding: 0 24px 28px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #2a4a2a;
  margin-bottom: 6px;
}
.form-group input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border: 1.5px solid #dce8dc;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  background: #fafcfa;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-group input:focus {
  outline: none;
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
  background: #fff;
}
.form-actions {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f7f0;
  margin-top: 8px;
}
.btn-cancel {
  flex: 1;
  height: 44px;
  background: #f4faf4;
  color: #6a8a6a;
  border: 1.5px solid #dce8dc;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel:hover {
  background: #e8f5e8;
  color: #2e7d32;
}
.btn-create {
  flex: 1;
  height: 44px;
  background: linear-gradient(135deg, #2e7d32, #43a047);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-create:hover {
  opacity: 0.92;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .content-body {
    padding: 14px 0;
    gap: 14px;
  }

  .greeting-banner {
    padding: 18px 16px;
    border-radius: 14px;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .greeting-title {
    font-size: 22px;
  }

  .greeting-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .btn-primary,
  .btn-outline {
    height: 38px;
    padding: 0 14px;
    font-size: 12.5px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 14px;
    gap: 10px;
  }

  .stat-value {
    font-size: 24px;
  }

  .mid-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .card-head {
    padding: 16px 16px 0;
  }

  .chart-area,
  .dept-list,
  .activity-list {
    padding-left: 16px;
    padding-right: 16px;
  }

  .table-card {
    overflow-x: auto;
  }

  .data-table {
    min-width: 700px;
  }

  .modal-content {
    margin: 20px;
    width: calc(100vw - 40px);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .greeting-title {
    font-size: 20px;
  }

  .greeting-sub {
    font-size: 12px;
  }

  .btn-primary,
  .btn-outline {
    width: 100%;
    justify-content: center;
  }

  .bar-chart {
    gap: 6px;
  }

  .meeting-item {
    padding: 8px 6px;
    gap: 8px;
  }
}


</style>

