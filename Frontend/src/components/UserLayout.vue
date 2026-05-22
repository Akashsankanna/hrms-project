<template>
  <div class="shell">

    <!-- ── SIDEBAR OVERLAY (Mobile) ── -->
    <div
      class="sidebar-overlay"
      v-if="isMobile && sidebarOpen"
      @click="sidebarOpen = false"
    ></div>

    <!-- ── SIDEBAR ── -->
    <aside class="sidebar" :class="{ 'sidebar-mobile-open': isMobile && sidebarOpen }">

      <!-- Mobile Header (hamburger + company name) — only on mobile -->
      <div class="sb-mobile-header" v-if="isMobile">
        <button class="sb-close-btn" @click="sidebarOpen = false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="sb-mobile-company">
          <div class="sb-name">TWO ELEPHANTS TECHNOLOGIES LLP</div>
          <div class="sb-sub">My Workspace</div>
        </div>
      </div>

      <!-- Brand (Desktop only) -->
      <div class="sb-brand">
        <div class="sb-logo-mark">
          <img class="sb-logo-img" src="../assets/logo.svg" alt="TWO ELEPHANTS TECHNOLOGIES LLP logo">
        </div>
        <div>
          <div class="sb-name">TWO ELEPHANTS TECHNOLOGIES LLP</div>
          <div class="sb-sub">My Workspace</div>
        </div>
      </div>

      <!-- User Card -->
      <!-- Nav -->
      <nav class="sb-nav">
        <router-link
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="sb-link"
          active-class="sb-link-active"
          @click="isMobile && (sidebarOpen = false)" >
          <div class="sb-icon" v-html="item.icon"></div>
          <span>{{ item.label }}</span>
          <span v-if="item.badge" class="sb-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <!-- Bottom Profile (aligned with Admin footer style) -->
      <div class="sb-footer">
    <div class="sb-user-wrap" ref="userWrap">

    <div class="sb-user" @click="toggleUserMenu">
      <div class="sb-avatar">{{ userInitials }}</div>

      <div class="sb-user-info">
        <div class="sb-user-name">{{ userName }}</div>
        <div class="sb-user-role">{{ userRole }}</div>
      </div>

      <svg
        class="sb-chevron"
        :class="{ rotated: showUserMenu }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2">
        <polyline points="18 15 12 9 6 15"/>
      </svg>
    </div>

    <!-- POPUP -->
    <transition name="pop">
      <div v-if="showUserMenu" class="user-popup">
        <div class="up-header">
          <div class="up-av">{{ userInitials }}</div>
          <div>
            <div class="up-name">{{ userName }}</div>
            <div class="up-role">{{ userRole }}</div>
          </div>
        </div>

        <div class="up-divider"></div>

        <button class="up-item logout" @click="logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </transition>
  </div>
</div>
    </aside>

    <!-- ── TOPBAR (standardized to match Admin) ── -->
    <header class="topbar">
      <!-- Hamburger Button (Mobile only) -->
      <button class="mobile-toggle" @click="sidebarOpen = !sidebarOpen" v-if="isMobile" aria-label="Toggle sidebar">
        ☰
      </button>

      <div class="tb-left">
        <div class="tb-title">{{ pageTitle }}</div>
        <div class="tb-crumb">Home &rsaquo; <span>{{ pageTitle }}</span></div>
      </div>
      <div class="tb-spacer"></div>
      <div class="tb-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" :placeholder="searchPlaceholder" v-model="q">
      </div>
      <div class="tb-actions">
        <router-link to="/user/notifications" class="tb-icon" title="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span class="pip" v-if="unreadCount > 0"></span>
        </router-link>
        <button class="tb-icon" title="Calendar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </button>
        <div class="tb-av">{{ userInitials }}</div>
      </div>
    </header>

    <!-- ── MAIN ── -->
    <main class="page-main">
      <!-- PAGE HERO (standardized) -->
      <section class="page-hero">
        <div class="hero-inner">
          <div class="hero-left">
            <slot name="hero-left">
              <div class="hero-kicker" v-if="pageSub">{{ pageSub }}</div>
              <div class="hero-title">{{ pageTitle }}</div>
            </slot>
          </div>
          <div class="hero-right">
            <slot name="hero-right" />
          </div>
        </div>
      </section>
      <slot />
    </main>
  </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode'
export default {
  name: 'UserLayout',
  props: {
    pageTitle:         { type: String, default: 'Dashboard' },
    pageSub:           { type: String, default: '' },
    searchPlaceholder: { type: String, default: 'Search…' },
    unreadCount:       { type: Number, default: 3 },
  },
  data() {
    return {
      q: '',
      sidebarOpen: false,
      isMobile: false,
      showUserMenu: false,
      userName: 'Employee',
      userRole: 'Employee',
      userInitials: 'EE',
      nav: [
        {
          to: '/user/dashboard',
          label: 'Dashboard',
          badge: null,
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>'
        },
        {
          to: '/user/profile',
          label: 'Profile',
          badge: null,
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0113 0"/></svg>'
        },
        {
          to: '/user/attendance',
          label: 'Attendance',
          badge: null,
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>'
        },
        {
          to: '/user/leave',
          label: 'Leave',
         
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
        },
        {
          to: '/user/calendar',
          label: 'Calendar',
          badge: null,
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
        },
        {
          to: '/user/notifications',
          label: 'Notifications',
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>'
        },
      ],
    }
  },

  mounted() {

  const token =
    sessionStorage.getItem('hrms_token') ||
    localStorage.getItem('hrms_token')

  if (token) {

    try {

      const decoded = jwtDecode(token)

      const fullName =
        decoded.name ||
        `${decoded.given_name || ''} ${decoded.family_name || ''}`.trim() ||
        decoded.preferred_username ||
        'Employee'

      this.userName = fullName

      this.userRole =
        decoded.realm_access?.roles?.includes('admin')
          ? 'HR Administrator'
          : 'Employee'

      this.userInitials = fullName
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    } catch (e) {

      console.log("Token decode failed", e)
    }
  }

  document.addEventListener('click', this.handleOutsideClick)

  this.checkMobile()

  window.addEventListener('resize', this.checkMobile)
},
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    document.removeEventListener('click', this.handleOutsideClick)
  },

  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) {
        this.sidebarOpen = false;
      }
    },

    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },

    handleOutsideClick(e) {
      if (this.$refs.userWrap &&
          !this.$refs.userWrap.contains(e.target)) {
        this.showUserMenu = false
      }
    },

    logout() {
      localStorage.clear()
      sessionStorage.clear()
      this.$router.push('/login')
    },
  }
}
</script>

<style scoped>
/* ─────────────────────────────────────────
   CSS Variables / Root
───────────────────────────────────────── */
:root { --sidebar-w: 240px; }

/* ─────────────────────────────────────────
   Shell
───────────────────────────────────────── */
.shell { display: flex; min-height: 100vh; background: var(--bg-main); }

/* ─────────────────────────────────────────
   Sidebar — Desktop
───────────────────────────────────────── */
.sidebar {
  width: var(--sidebar-w);
  background: var(--bg-sidebar);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  position: fixed;
  top: 0; left: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 200;
  overflow-y: auto;
}

/* Brand */
.sb-brand {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 22px 20px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.sb-logo-mark {
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: transparent;
  border-radius: 0;
  width: auto;
  height: auto;
}
.sb-logo-img { width: auto; height: 44px; object-fit: contain; display: block; }
.sb-name {
  font-family: 'Lora', serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
}
.sb-sub {
  font-size: 10px;
  color: #7a9a7a;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-top: 2px;
}

/* User Card */
.sb-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint), var(--forest));
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; color: #fff;
  flex-shrink: 0;
}
.sb-user-name { font-size: 13px; font-weight: 600; color: #e0ede0; }
.sb-user-role { font-size: 11px; color: #6a8a6a; margin-top: 1px; }

/* Footer (match Admin sidebar footer layout) */
.sb-footer {
  padding: 14px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.sb-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: var(--r-sm);
  cursor: pointer;
}
.sb-user:hover { background: rgba(255,255,255,0.06); }
.sb-user-info { flex: 1; min-width: 0; }

/* ── USER DROPDOWN WRAPPER ── */

.sb-user-wrap {
  position: relative;
  padding: 10px 12px;
}

/* ── CHEVRON ── */

.sb-chevron {
  width: 14px;
  height: 14px;
  color: rgba(255,255,255,.35);
  flex-shrink: 0;
  transition: transform 0.22s ease;
}

.sb-chevron.rotated {
  transform: rotate(180deg);
}


/* Nav */
.sb-nav {
  flex: 1;
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sb-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--r-sm);
  color: rgba(255,255,255,.55);
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.18s;
  position: relative;
}
.sb-link:hover {
  background: rgba(255,255,255,.07);
  color: rgba(255,255,255,.9);
}
.sb-link-active {
  background: var(--mint) !important;
  color: var(--forest-ink) !important;
  font-weight: 600;
}
.sb-link-active .sb-icon svg { opacity: 1; }
.sb-icon {
  width: 18px; height: 18px;
  display: flex; align-items: center;
  flex-shrink: 0;
  color: currentColor;
}
.sb-icon svg { width: 18px; height: 18px; stroke: currentColor; opacity: .65; }
.sb-badge {
  margin-left: auto;
  background: rgba(255,255,255,.12);
  color: rgba(255,255,255,.7);
  font-size: 10px; font-weight: 700;
  padding: 1px 7px;
  border-radius: 20px;
}
.sb-link-active .sb-badge {
  background: rgba(36,51,40,.18);
  color: var(--forest-ink);
}

/* Mobile header inside sidebar — hidden on desktop */
.sb-mobile-header { display: none; }

/* ── USER POPUP ───────────────────────── */

.user-popup {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 8px;
  right: 8px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  z-index: 500;
}

.up-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 12px;
}

.up-av {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2e7d32, #43a047);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.up-name {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a2e1a;
}

.up-role {
  font-size: 11px;
  color: #2e7d32;
  font-weight: 600;
  margin-top: 1px;
}

.up-divider {
  height: 1px;
  background: #f0f7f0;
}

/* ── LOGOUT BUTTON ── */

.up-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 13px 16px;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background .15s;
  text-align: left;
}

.up-item svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.up-item.logout {
  color: #c62828;
}

.up-item.logout:hover {
  background: #fbe9e7;
}

/* ── POPUP ANIMATION ── */
.pop-enter-active {
  animation: popUp 0.16s ease;
}

.pop-leave-active {
  animation: popUp 0.12s ease reverse;
}

@keyframes popUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Topbar (match Admin) ── */
.topbar {
  position: fixed;
  top: 0;
  left: var(--sidebar-w);
  right: 0;
  height: var(--topbar-h, 64px);
  background: var(--bg-card, #fff);
  border-bottom: 1px solid var(--border, #e2eee5);
  display: flex;
  align-items: center;
  padding: 0 26px;
  gap: 12px;
  z-index: 100;
}
.mobile-toggle {
  display: none;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--r-sm, 8px);
  background: var(--forest-ink, #1f3d2b);
  color: #fff;
  cursor: pointer;
}
.tb-left { display: flex; flex-direction: column; }
.tb-title {
  font-family: 'Lora', serif;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-1, #1a2e1a);
}
.tb-crumb { font-size: 11.5px; color: var(--text-3, #6b7d6f); margin-top: 1px; }
.tb-crumb span { color: var(--text-2, #3d5240); font-weight: 500; }
.tb-spacer { flex: 1; }
.tb-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--stone-ghost, #f4faf4);
  border: 1px solid var(--border, #e2eee5);
  border-radius: var(--r-sm, 8px);
  padding: 7px 13px;
  width: 220px;
  transition: border-color .18s, box-shadow .18s;
}
.tb-search:focus-within { border-color: var(--mint-mid, #86d98b); box-shadow: 0 0 0 3px rgba(134,217,139,.15); }
.tb-search svg { width: 13px; height: 13px; color: var(--text-3, #6b7d6f); flex-shrink: 0; }
.tb-search input { border: none; background: transparent; font-size: 13px; font-family: inherit; color: var(--text-1, #1a2e1a); outline: none; width: 100%; }
.tb-search input::placeholder { color: var(--text-3, #6b7d6f); }
.tb-actions { display: flex; align-items: center; gap: 8px; }
.tb-icon {
  width: 36px;
  height: 36px;
  border: 1px solid var(--border, #e2eee5);
  background: var(--bg-card, #fff);
  border-radius: var(--r-sm, 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: background .18s;
  text-decoration: none;
}
.tb-icon:hover { background: var(--stone-ghost, #f4faf4); }
.tb-icon svg { width: 16px; height: 16px; color: var(--text-2, #3d5240); }
.pip {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--peach-mid, #f0a090);
  border: 1.5px solid var(--bg-card, #fff);
}
.tb-av {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--mint, #a9e9ad), var(--forest, #2e7d32));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  border: 2px solid var(--border, #e2eee5);
}

/* ─────────────────────────────────────────
   Main
───────────────────────────────────────── */
.page-main {
  margin-left: var(--sidebar-w);
  margin-top: var(--topbar-h, 64px);
  padding: 28px 28px 40px;
  min-height: calc(100vh - var(--topbar-h, 64px));
  flex: 1;
}

/* ── Standard hero (match Admin) ── */
.page-hero {
  background: linear-gradient(135deg, #1a2e1a 0%, #2e7d32 100%);
  border-radius: 18px;
  padding: 18px 24px;
  box-shadow: 0 4px 20px rgba(46,125,50,0.22);
  margin-bottom: 18px;
  position: relative;
  overflow: hidden;
}
.page-hero::after {
  content: '';
  position: absolute;
  right: -40px;
  top: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
}
.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  position: relative;
  z-index: 1;
}
.hero-left { min-width: 0; }
.hero-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.hero-kicker { font-size: 12px; color: rgba(255,255,255,0.55); margin-bottom: 6px; letter-spacing: 0.04em; }
.hero-title  { font-family: 'DM Serif Display', serif; font-size: 28px; color: #fff; font-weight: 400; line-height: 1.1; }

/* ─────────────────────────────────────────
   Sidebar Overlay (Mobile)
───────────────────────────────────────── */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 180;
  animation: fadeIn 0.25s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ─────────────────────────────────────────
   MOBILE — ≤ 768px
───────────────────────────────────────── */
@media (max-width: 768px) {

  .mobile-toggle { display: inline-flex; align-items: center; justify-content: center; }

  /* Sidebar: off-screen by default (match Admin behavior) */
  .sidebar {
    left: -260px;
  }

  /* Slide in */
  .sidebar.sidebar-mobile-open {
    left: 0;
  }

  /* Show mobile header inside sidebar */
  .sb-mobile-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 16px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  /* Close / Hamburger button inside sidebar */
  .sb-close-btn {
    width: 38px; height: 38px;
    background: rgba(255, 255, 255, 0.1);
    border: 1.5px solid rgba(255, 255, 255, 0.18);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.18s;
  }
  .sb-close-btn:hover { background: rgba(255, 255, 255, 0.18); }
  .sb-close-btn svg { width: 18px; height: 18px; }

  /* Company name next to hamburger inside sidebar */
  .sb-mobile-company .sb-name {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.92);
  }
  .sb-mobile-company .sb-sub {
    font-size: 9px;
    color: rgba(255, 255, 255, 0.45);
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-top: 2px;
  }

  /* Hide desktop brand */
  .sb-brand { display: none; }

  .sb-avatar {
    width: 32px; height: 32px;
    font-size: 11px;
    background: linear-gradient(135deg, var(--mint), var(--forest));
    border: 1.5px solid rgba(255, 255, 255, 0.18);
  }
  .sb-user-name { font-size: 12px; color: rgba(255, 255, 255, 0.9); }
  .sb-user-role { font-size: 10px; color: rgba(255, 255, 255, 0.45); }

  .sb-link { color: rgba(255, 255, 255, 0.55); font-size: 13px; }
  .sb-link:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
  .sb-link-active { background: var(--mint) !important; color: var(--forest-ink) !important; font-weight: 600; border: none; }

  .sb-footer {
    padding: 12px 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
  .sb-user {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 10px 12px;
  }

  .topbar { left: 0; padding-left: 60px; }
  .tb-search { width: 140px; }

  /* Main */
  .page-main {
    margin-left: 0;
    padding: 20px;
  }

  .page-hero {
    padding: 16px;
    border-radius: 14px;
    margin-bottom: 14px;
  }
  .hero-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .hero-title { font-size: 22px; }
  .hero-right { width: 100%; flex-wrap: wrap; }
}

/* Keep topbar compact on small screens */
@media (max-width: 768px) {
  .topbar { padding-right: 10px; gap: 6px; }
  .tb-crumb { display: none; }
  .tb-search { width: 140px; }
}

/* ─────────────────────────────────────────
   MOBILE — ≤ 600px
───────────────────────────────────────── */
@media (max-width: 600px) {
  .sb-nav { padding: 4px 8px; gap: 1px; }
  .sb-link { padding: 9px 8px; font-size: 12.5px; }
  .sb-icon { width: 16px; height: 16px; }
  .sb-icon svg { width: 16px; height: 16px; }
  .tb-search { display: none; }
}

/* ─────────────────────────────────────────
   MOBILE — ≤ 480px
───────────────────────────────────────── */
@media (max-width: 480px) {
  .sb-close-btn { width: 34px; height: 34px; border-radius: 8px; }
  .sb-close-btn svg { width: 16px; height: 16px; }
  .sb-mobile-company .sb-name { font-size: 12px; }
  .sb-avatar { width: 28px; height: 28px; font-size: 9px; }
  .sb-user-name { font-size: 11px; }
  .sb-user-role { font-size: 9px; }
  .topbar { padding-right: 10px; gap: 6px; }
}
</style>