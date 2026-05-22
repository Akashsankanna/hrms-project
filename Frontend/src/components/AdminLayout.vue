<template>
  <div class="shell">
    <button class="mobile-toggle" @click="toggleSidebar">☰</button>

    <!-- SIDEBAR -->
    <aside class="sidebar" :class="{ open: isSidebarOpen }">
      <div class="sb-logo">
        <div class="sb-mark">
          <img class="sb-logo-img" src="../assets/logo.svg" alt="TWO ELEPHANTS TECHNOLOGIES LLP logo">
        </div>
        <div>
          <div class="sb-name">TWO ELEPHANTS TECHNOLOGIES LLP</div>
          <div class="sb-tag">Admin Panel</div>
        </div>
      </div>

      <nav class="sb-nav">
        <div class="sb-section">Main</div>
        <router-link v-for="item in mainNav" :key="item.to" :to="item.to" class="sb-item" active-class="active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="item.icon"></svg>
          {{ item.label }}
          <span class="sb-chip" v-if="item.badge">{{ item.badge }}</span>
        </router-link>

        <div class="sb-section" style="margin-top:8px">Account</div>
        <router-link to="/profile" class="sb-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Profile
        </router-link>
        <a class="sb-item" href="#">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          Settings
        </a>
      </nav>

      <!-- SIDEBAR FOOTER — current user + logout popup -->
      <div class="sb-footer">
        <div class="sb-user-wrap" ref="userWrap">
          <div class="sb-user" @click="toggleUserMenu">
            <div class="sb-av">{{ currentUser.initials }}</div>
            <div class="sb-user-info">
              <div class="sb-uname">{{ currentUser.name }}</div>
              <div class="sb-urole">{{ currentUser.role }}</div>
            </div>
            <svg class="sb-chevron" :class="{ rotated: showUserMenu }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="18 15 12 9 6 15"/>
            </svg>
          </div>

          <!-- Popup -->
          <transition name="pop">
            <div v-if="showUserMenu" class="user-popup">
              <div class="up-header">
                <div class="up-av">{{ currentUser.initials }}</div>
                <div>
                  <div class="up-name">{{ currentUser.name }}</div>
                  <div class="up-role">{{ currentUser.role }}</div>
                  <div class="up-email">{{ currentUser.email }}</div>
                </div>
              </div>
              <div class="up-divider"></div>
              <button class="up-item logout" @click="logout" :disabled="loggingOut">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {{ loggingOut ? 'Logging out…' : 'Logout' }}
              </button>
            </div>
          </transition>
        </div>
      </div>
    </aside>

    <!-- TOPBAR -->
    <header class="topbar">
      <div class="tb-left">
        <div class="tb-title">{{ pageTitle }}</div>
        <div class="tb-crumb">Home &rsaquo; <span>{{ pageTitle }}</span></div>
      </div>
      <div class="tb-spacer"></div>
      <div class="tb-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" :placeholder="'Search ' + pageTitle.toLowerCase() + '…'" v-model="query">
      </div>
      <div class="tb-actions">
        <button class="tb-icon" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span class="pip"></span>
        </button>

          <button
    v-if="showAdd"
    class="tb-add"
    @click="$emit('add')"
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    {{ addLabel }}
  </button>
          
        
      </div>
    </header>

    <!-- PAGE CONTENT -->
    <main class="page-main">
     
      <slot />
    </main>
  </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode'

export default {
  name: 'AdminLayout',
  emits: ['add', 'search'],
  props: {
    pageTitle: { type: String, default: 'Dashboard' },
    addLabel:  { type: String, default: 'Add new' },
    showAdd:   { type: Boolean, default: true },
  },
  data() {
    return {
      isSidebarOpen: false,
      query: '',
      showLogout: false,
      showLogoutModal: false,
      loggingOut: false,
      showUserMenu : false,

      // User info decoded from JWT
       currentUser: {
        name: 'User',
        email: '',
        role: 'Employee',
        initials: 'U',
      },

      mainNav: [
        { to: '/dashboard',   label: 'Dashboard',    icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>' },
        { to: '/employees',   label: 'Employees',   icon: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>' },
        { to: '/attendance',  label: 'Attendance',   icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>' },
        { to: '/calendar',    label: 'Calendar',     icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
        { to: '/leave',       label: 'Leave Mgmt',   icon: '<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>' },
        { to: '/projects',    label: 'Onboarding',    icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>' },
        { to: '/departments', label: 'Reports & Analytics',  icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>' },
        { to: '/departm', label: 'Performance Mgmt',  icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>' },
        { to: '/departm', label: 'HR Policy',  icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>' },

      ],
    }
  },

  mounted() {
    this.loadUserFromToken()
    document.addEventListener('click', this.handleOutsideClick)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },

  watch: {
    query(val) { this.$emit('search', val) },
    $route()   { this.isSidebarOpen = false }
  },

  methods: {
    // ── Load user info from stored JWT ──────────────────────────────
    loadUserFromToken() {
      const token = sessionStorage.getItem('hrms_token') || localStorage.getItem('hrms_token')
      if (!token) return
      try {
        const decoded = jwtDecode(token)

        // Keycloak puts full name in `name`, or compose from given/family
        const fullName = decoded.name
          || `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim()
          || decoded.preferred_username
          || 'User'

         this.currentUser.name     = fullName
this.currentUser.email    = decoded.email || decoded.preferred_username || ''
this.currentUser.initials = fullName
  .split(' ')
  .map(w => w[0])
  .join('')
  .toUpperCase()
  .slice(0, 2)

        // Role from Keycloak realm_access
        const roles = decoded.realm_access?.roles || []
        this.currentUser.role = roles.includes('admin')
  ? 'HR Administrator'
  : roles.includes('employee')
  ? 'Employee'
  : decoded.preferred_username || 'User'
      } catch (e) {
        console.error('Token decode failed:', e)
      }
    },

    // ── Popup toggle ─────────────────────────────────────────────────
    toggleUserMenu() {
       this.showUserMenu = !this.showUserMenu
    },

    handleOutsideClick(e) {
      if (this.$refs.userWrap && !this.$refs.userWrap.contains(e.target)) {
       this.showUserMenu = false
     }
    },

    goToProfile() {
      this.showLogout = false
      this.$router.push('/profile')
    },

    confirmLogout() {
      this.showLogout = false
      this.showLogoutModal = true
    },

    // ── Full logout: backend → localStorage → Keycloak ───────────────
    async logout() {
      this.loggingOut = true
      const token = sessionStorage.getItem('hrms_token') || localStorage.getItem('hrms_token')

      // 1. Invalidate session on backend (optional but recommended)
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (_) { /* non-blocking */ }

      // 2. Clear all local storage
      localStorage.clear()
      sessionStorage.clear()

      // 3. Redirect to Keycloak logout endpoint
      //    This ends the SSO session on Keycloak itself
                this.$router.push('/login');

    },

    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    }
  }
}
</script>

<style scoped>
/* ── Shell ── */
.shell { display: flex; min-height: 100vh; }

/* ── MOBILE TOGGLE BUTTON ── */
.mobile-toggle {
  display: none;
  position: fixed;
  top: 10px; left: 12px;
  z-index: 300;
  background: var(--forest-ink);
  color: white; border: none;
  padding: 8px 10px; border-radius: 6px;
  cursor: pointer;
}

/* ── Sidebar ── */
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-sidebar);
  position: fixed; left: 0; top: 0; bottom: 0;
  display: flex; flex-direction: column;
  z-index: 200; overflow-y: auto;
  transition: left 0.3s ease;
}

/* ── Topbar ── */
.topbar {
  position: fixed; top: 0;
  left: var(--sidebar-w); right: 0;
  height: var(--topbar-h);
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center;
  padding: 0 26px; gap: 12px; z-index: 100;
}

/* ── Page main ── */
.page-main {
  margin-left: var(--sidebar-w);
  margin-top: var(--topbar-h);
  padding: 28px 28px 40px;
  min-height: calc(100vh - var(--topbar-h));
  flex: 1;
}

/* ── Standard hero ── */
.page-hero {
  background: linear-gradient(135deg, #1a2e1a 0%, #2e7d32 100%);
  border-radius: 18px; padding: 18px 24px;
  box-shadow: 0 4px 20px rgba(46,125,50,0.22);
  margin-bottom: 18px; position: relative; overflow: hidden;
}
.page-hero::after {
  content: ''; position: absolute;
  right: -40px; top: -40px;
  width: 200px; height: 200px; border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.hero-inner {
  display: flex; align-items: center;
  justify-content: space-between; gap: 14px;
  position: relative; z-index: 1;
}
.hero-left { min-width: 0; }
.hero-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.hero-kicker { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 6px; letter-spacing: 0.04em; }
.hero-title  { font-family: 'DM Serif Display', serif; font-size: 28px; color: #fff; font-weight: 400; line-height: 1.1; }
.hero-sub    { font-size: 13.5px; color: rgba(255,255,255,0.72); margin-top: 6px; }

/* ── Sidebar logo ── */
.sb-logo {
  display: flex; align-items: flex-start; gap: 11px;
  padding: 22px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.sb-mark { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.sb-logo-img { width: auto; height: 44px; object-fit: contain; display: block; }
.sb-name { font-family: 'Lora', serif; font-size: 16px; font-weight: 600; color: #fff; }
.sb-tag  { font-size: 10px; color: rgba(169,233,173,.5); letter-spacing: 1.2px; text-transform: uppercase; margin-top: 1px; }

/* ── Nav ── */
.sb-nav { flex: 1; padding: 10px 0; }
.sb-section {
  font-size: 9.5px; font-weight: 700; letter-spacing: 1.8px;
  text-transform: uppercase; color: rgba(255,255,255,.25);
  padding: 16px 20px 6px;
}
.sb-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 14px; margin: 1px 8px;
  border-radius: var(--r-sm);
  color: rgba(255,255,255,.55);
  font-size: 13.5px; font-weight: 500;
  text-decoration: none;
  transition: all .18s;
}
.sb-item svg { width: 16px; height: 16px; flex-shrink: 0; opacity: .65; }
.sb-item:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
.sb-item.active { background: var(--mint); color: var(--forest-ink); font-weight: 600; }
.sb-item.active svg { opacity: 1; }
.sb-chip {
  margin-left: auto; font-size: 10px; font-weight: 700;
  padding: 1px 7px; border-radius: 20px;
  background: rgba(255,255,255,.12); color: rgba(255,255,255,.7);
}
.sb-item.active .sb-chip { background: rgba(36,51,40,.18); color: var(--forest-ink); }

/* ── Footer / user ── */
.sb-footer {
  border-top: 1px solid rgba(255,255,255,.07);
}

.sb-user-wrap { position: relative; padding: 10px 12px; }

.sb-user {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: var(--r-sm);
  cursor: pointer; user-select: none;
  transition: background .18s;
}
.sb-user:hover { background: rgba(255,255,255,.07); }

.sb-av {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--mint), var(--forest));
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.sb-user-info { flex: 1; overflow: hidden; min-width: 0; }
.sb-uname { font-size: 12.5px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sb-urole { font-size: 11px; color: rgba(255,255,255,.4); }

.sb-chevron {
  width: 14px; height: 14px;
  color: rgba(255,255,255,.35); flex-shrink: 0;
  transition: transform 0.22s ease;
}
.sb-chevron.rotated { transform: rotate(180deg); }

/* ── User popup ── */
.user-popup {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 8px; right: 8px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  z-index: 500;
}

.up-header {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 16px 12px;
}
.up-av {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #2e7d32, #43a047);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.up-name  { font-size: 13.5px; font-weight: 700; color: #1a2e1a; }
.up-role  { font-size: 11px; color: #2e7d32; font-weight: 600; margin-top: 1px; }
.up-email { font-size: 11px; color: #8aaa8a; margin-top: 2px; }

.up-divider { height: 1px; background: #f0f7f0; }

.up-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 13px 16px;
  border: none; background: none;
  font-family: inherit; font-size: 13.5px; font-weight: 500;
  cursor: pointer; transition: background .15s; text-align: left;
}
.up-item svg { width: 15px; height: 15px; flex-shrink: 0; }
.up-item.logout { color: #c62828; }
.up-item.logout:hover { background: #fbe9e7; }
.up-item:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Popup transition ── */
.pop-enter-active { animation: popUp 0.16s ease; }
.pop-leave-active { animation: popUp 0.12s ease reverse; }
@keyframes popUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Topbar ── */
.tb-title { font-family: 'Lora', serif; font-size: 17px; font-weight: 600; color: var(--text-1); }
.tb-crumb { font-size: 11.5px; color: var(--text-3); margin-top: 1px; }
.tb-crumb span { color: var(--text-2); font-weight: 500; }
.tb-spacer { flex: 1; }
.tb-search {
  display: flex; align-items: center; gap: 8px;
  background: var(--stone-ghost); border: 1px solid var(--border);
  border-radius: var(--r-sm); padding: 7px 13px; width: 220px;
  transition: border-color .18s, box-shadow .18s;
}
.tb-search:focus-within { border-color: var(--mint-mid); box-shadow: 0 0 0 3px rgba(134,217,139,.15); }
.tb-search svg { width: 13px; height: 13px; color: var(--text-3); flex-shrink: 0; }
.tb-search input { border: none; background: transparent; font-size: 13px; font-family: inherit; color: var(--text-1); outline: none; width: 100%; }
.tb-search input::placeholder { color: var(--text-3); }
.tb-actions { display: flex; align-items: center; gap: 8px; }
.tb-icon {
  width: 36px; height: 36px;
  border: 1px solid var(--border); background: var(--bg-card);
  border-radius: var(--r-sm); display: flex; align-items: center;
  justify-content: center; position: relative; transition: background .18s;
  cursor: pointer;
}
.tb-icon:hover { background: var(--stone-ghost); }
.tb-icon svg { width: 16px; height: 16px; color: var(--text-2); }
.pip {
  position: absolute; top: 7px; right: 7px;
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--peach-mid); border: 1.5px solid var(--bg-card);
}
.tb-add {
  display: flex; align-items: center; gap: 7px;
  background: var(--forest-ink); color: #fff;
  border: none; padding: 8px 16px; border-radius: var(--r-sm);
  font-size: 13px; font-weight: 600; transition: background .18s;
  white-space: nowrap; min-width: fit-content; cursor: pointer;
}
.tb-add:hover { background: var(--forest-deep); }
.tb-add svg { width: 13px; height: 13px; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .mobile-toggle { display: block; }
  .sidebar { left: -260px; }
  .sidebar.open { left: 0; }
  .topbar { left: 0; padding-left: 60px; }
  .page-main { margin-left: 0; padding: 20px; }
  .tb-add { width: 36px; height: 36px; padding: 0; font-size: 0; justify-content: center; flex-shrink: 0; }
  .tb-add svg { width: 14px; height: 14px; margin: 0; }
  .tb-search { width: 140px; }
  .page-hero { padding: 16px; border-radius: 14px; margin-bottom: 14px; }
  .hero-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
  .hero-title { font-size: 22px; }
  .hero-right { width: 100%; flex-wrap: wrap; }
}

@media (max-width: 520px) {
  .topbar { padding-right: 10px; gap: 6px; }
  .tb-crumb, .tb-search, .tb-icon { display: none; }
  .tb-title { font-size: 15px; }
  .page-main { padding: 16px 14px 24px; }
}
</style>