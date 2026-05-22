<template>
  <div class="page">

    <div class="layout">

      <!-- LEFT -->
      <div class="left-panel">
        <div class="left-content">
          <!-- ✅ LOGO (FIXED PROPERLY) -->
          <div class="desk-image-wrapper">
            <img :src="logo" class="desk-image"/>
          </div>

          <h1 class="hero-title">
            Two <span class="hero-green">Elephants Technologies LLP</span><br/>
            HRMS.
          </h1>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="right-panel">
        <div class="login-card" :class="{ flip: isResetMode }">

          <!-- LOGIN FORM -->
          <div v-if="!isResetMode" class="form-container">
            <h2 class="welcome-title">Welcome Back</h2>

            <div class="form">
              <input v-model="email" placeholder="Email" class="field-input"/>
              
              <div class="input-wrapper">
                <input v-model="password" :type="showPassword ? 'text' : 'password'" placeholder="Password" class="field-input"/>
                <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>

              <p v-if="errorMessage" style="color:red;text-align:center;">
                {{ errorMessage }}
              </p>

              <button class="signin-btn" @click="handleSignIn">
                Sign In
              </button>

              <button class="flip-btn" @click="toggleReset">
                Forgot Password?
              </button>
            </div>
          </div>

          <!-- FORGOT PASSWORD FORM -->
          <div v-else class="form-container">
            <h2 class="welcome-title">Reset Password</h2>

            <p class="subtitle">Update your password</p>

            <div class="form">
              <input v-model="resetEmail" placeholder="Email" class="field-input"/>
              
              <div class="input-wrapper">
                <input v-model="newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="New Password" class="field-input"/>
                <button type="button" class="eye-btn" @click="showNewPassword = !showNewPassword">
                  <svg v-if="!showNewPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
              
              <div class="input-wrapper">
                <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirm Password" class="field-input"/>
                <button type="button" class="eye-btn" @click="showConfirmPassword = !showConfirmPassword">
                  <svg v-if="!showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>

              <p v-if="errorMessage" style="color:red;text-align:center;">
                {{ errorMessage }}
              </p>

              <button class="signin-btn" @click="handlePasswordReset">
                Update Password
              </button>

              <button class="flip-btn" @click="toggleReset">
                Back to Login
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script>
import logo from '@/assets/logo.svg'
import { authAPI } from '@/services/api'   // ✅ IMPORT API

export default {
  name: 'LoginPage',

  data() {
    return {
      logo,
      isResetMode: false,
      email: '',
      password: '',
      showPassword: false,
      resetEmail: '',
      newPassword: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false,
      errorMessage: ''
    }
  },

  methods: {
    toggleReset() {
      this.isResetMode = !this.isResetMode;
      this.errorMessage = '';
      this.email = '';
      this.password = '';
      this.resetEmail = '';
      this.newPassword = '';
      this.confirmPassword = '';
    },

    

    // ✅ LOGIN CONNECTED TO BACKEND
    async handleSignIn() {
      this.errorMessage = '';

      try {
        const email = this.email.trim().toLowerCase();
        const password = this.password.trim();

        const res = await authAPI.login(email, password);
        
        const { access_token, refresh_token, user } = res.data;

        // ✅ STORE TOKENS
        sessionStorage.setItem('hrms_token', access_token);
        localStorage.setItem('hrms_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        // ✅ STORE USER DATA
        sessionStorage.setItem('hrms_role', user.role);
        sessionStorage.setItem('user_email', user.email);
          console.log("LOGIN USER:", user)

        if (user.employeeCode) {
      sessionStorage.setItem('employeeCode', user.employeeCode)
        }

        // ✅ FIRST LOGIN CHECK
        if (user.isFirstLogin) {
          sessionStorage.setItem('resetUser', user.email);
          this.$router.push('/change-password');
          return;
        }

        // ✅ ROLE BASED ROUTING
        if (user.role === 'admin') {
          this.$router.push('/dashboard');
        } else {
          this.$router.push('/user/dashboard');
        }

      } catch (err) {
        console.log(err);

        if (err.response?.status === 401) {
          this.errorMessage = "Invalid email or password";
        } 
        else if (err.response?.status === 403) {
          this.errorMessage = err.response.data?.error || "Access denied";

          // 🔥 HANDLE FIRST LOGIN FROM BACKEND
          if (err.response.data?.error?.includes("Password change required")) {
            this.isResetMode = true;
            this.resetEmail = this.email;
          }
        }
        else {
          this.errorMessage = "Login failed. Try again.";
        }
      }
    },

    // ✅ CHANGE PASSWORD (CONNECTED)
  async handlePasswordReset() {
  this.errorMessage = '';

  const email = this.resetEmail.trim().toLowerCase();
  const newPassword = this.newPassword.trim();
  const confirmPassword = this.newPassword.trim();

  // ✅ VALIDATION
  if (!email || !newPassword || !confirmPassword) {
    this.errorMessage = "Please fill all fields";
    return;
  }

  if (newPassword.length < 6) {
    this.errorMessage = "Password must be at least 6 characters";
    return;
  }

  if (newPassword !== confirmPassword) {
    this.errorMessage = "Passwords do not match";
    return;
  }

  try {
    // ✅ CALL YOUR BACKEND API
    const res = await authAPI.changePassword(email, newPassword);

    console.log("Password change response:", res.data);

    // ✅ SUCCESS UI
    alert("✅ Password updated successfully!");

    // 🔁 RESET FORM
    this.isResetMode = false;
    this.resetEmail = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';

  } catch (err) {
    console.log("Reset error:", err);

    if (err.response?.status === 404) {
      this.errorMessage = "User not found";
    } else {
      this.errorMessage = err.response?.data?.error || "Password reset failed";
    }
  }
  }}}
</script>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  min-height: 100vh;
  background: #d3f1d7;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* ── STATUS BAR ── */
.status-bar {
  position: absolute;
  top: 22px;
  right: 28px;
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 10;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46,125,50,0.18);
}

.status-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.status-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: #5a7a5a;
}

.status-value {
  font-size: 12px;
  color: #2d4a2d;
  font-weight: 400;
}

.lang-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid #c5d9c3;
  background: rgba(255,255,255,0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3a5a3a;
  transition: background 0.2s;
  font-size: 11px;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
}
.lang-btn:hover { background: rgba(255,255,255,0.9); }

/* ── LAYOUT ── */
.layout {
  display: flex;
  flex: 1;
  min-height: 100vh;
  padding: 0 clamp(20px, 4vw, 48px);
  gap: 0;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* ── LEFT PANEL ── */
.left-panel {
  flex: 1;
  padding: clamp(20px, 5vh, 60px) 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left-content {
  max-width: clamp(300px, 45vw, 550px);
  width: 100%;
}

.brand-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: #4a7a4a;
  margin-bottom: clamp(10px, 2vh, 16px);
}

.hero-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(28px, 6vw, 56px);
  line-height: 1.2;
  color: #1a2e1a;
  font-weight: 400;
  margin-bottom: clamp(12px, 2vh, 20px);
}

.hero-green {
  color: #2e7d32;
}

.tagline-block {
  border-left: 3px solid #2e7d32;
  padding-left: 18px;
  margin-bottom: clamp(20px, 3vh, 40px);
}

.tagline {
  font-size: clamp(13px, 2vw, 15px);
  color: #4a6a4a;
  line-height: 1.65;
  font-weight: 300;
}

.desk-image-wrapper {
  border-radius: 18px;
  overflow: hidden;
  max-width: clamp(200px, 35vw, 280px);
  margin-bottom: clamp(8px, 1.5vh, 16px);
}

.desk-image {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  display: block;
}

/* ── RIGHT PANEL ── */
.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(10px, 2vh, 40px) 0;
  min-height: clamp(400px, 90vh, 600px);
}

.login-card {
  background: #ffffff;
  border-radius: 24px;
  padding: clamp(32px, 4vw, 48px);
  width: 100%;
  max-width: clamp(300px, 90vw, 420px);
  height: fit-content;
  box-shadow: 0 8px 48px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04);
}

/* ── CARD HEADER ── */
.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo-icon {
  width: 38px;
  height: 38px;
  background: #2e7d32;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
 
}

.logo-text {
  font-size: 19px;
  font-weight: 600;
  color: #1a2e1a;
  letter-spacing: -0.02em;
}

.welcome-title {
  font-family: "Times New Roman", Times, serif;
  font-size: 32px;
  font-weight: 600;
  color: #1a2e1a;
  text-align: center;  
  margin-bottom: 12px;
}

.welcome-sub {
  font-size: 13.5px;
  color: #7a9a7a;
  margin-bottom: 28px;
  font-weight: 300;
}

/* ── FORM ── */
.form { display: flex; flex-direction: column; gap: 24px; }

.field-group { display: flex; flex-direction: column; gap: 7px; }

.field-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #4a6a4a;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #4a6a4a;
  text-decoration: none;
}
.forgot-link:hover { color: #2e7d32; }

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-input {
  width: 100%;
  height: 50px;
  border: 1.5px solid #dce8dc;
  border-radius: 10px;
  padding: 0 44px 0 16px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #1a2e1a;
  background: #fafcfa;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input::placeholder { color: #b0c8b0; }

.field-input:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46,125,50,0.1);
  background: #fff;
}

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #a0bca0;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: #2e7d32;
}

.eye-btn svg {
  width: 20px;
  height: 20px;
}

.input-icon {
  position: absolute;
  right: 14px;
  color: #a0bca0;
  pointer-events: none;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  pointer-events: all;
  padding: 0;
  display: flex;
}
.icon-btn:hover svg { stroke: #2e7d32; }

/* ── CHECKBOX ── */
.remember-row { margin: 2px 0; }

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: #4a6a4a;
  cursor: pointer;
  user-select: none;
}

.checkbox-input { display: none; }

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 1.5px solid #c0d8c0;
  border-radius: 4px;
  flex-shrink: 0;
  transition: all 0.2s;
  background: #fafcfa;
  position: relative;
}

.checkbox-input:checked + .checkbox-custom {
  background: #2e7d32;
  border-color: #2e7d32;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

/* ── SIGN IN BUTTON ── */
.signin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 52px;
  background: linear-gradient(135deg, #2e7d32, #43a047);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(46,125,50,0.3);
}

.signin-btn:hover {
  opacity: 0.93;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(46,125,50,0.35);
}

.signin-btn:active { transform: translateY(0); }

/* ── FLIP BUTTON ── */
.flip-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  background: #A9E9AD;
  color: #1a2e1a;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}

.flip-btn:hover {
  background: #99dfa0;
  transform: translateY(-1px);
}

.flip-btn:active { transform: translateY(0); }

/* ── SUBTITLE ── */
.subtitle {
  text-align: center;
  color: #6a8a6a;
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 300;
}

/* ── FORM CONTAINER ── */
.form-container {
  animation: fadeIn 0.4s ease;
}

/* ── PARTNER LOGIN ── */
.partner-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 4px;
}

.partner-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #a0bca0;
}

.partner-btns {
  display: flex;
  gap: 12px;
  width: 100%;
}

.partner-btn {
  flex: 1;
  height: 44px;
  border: 1.5px solid #dce8dc;
  border-radius: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #2d4a2d;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.partner-btn:hover {
  border-color: #a0c4a0;
  background: #f4faf4;
}

/* ── REQUEST ACCESS ── */
.request-access {
  text-align: center;
  font-size: 13px;
  color: #7a9a7a;
  margin-top: 4px;
}

.request-link {
  color: #1a2e1a;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1.5px solid #2e7d32;
  padding-bottom: 1px;
}
.request-link:hover { color: #2e7d32; }

/* ── FOOTER ── */
.footer {
  padding: 16px 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  letter-spacing: 0.09em;
  color: #7a9a7a;
  font-weight: 500;
  border-top: 1px solid rgba(0,0,0,0.05);
}

.footer-links {
  display: flex;
  gap: 28px;
}

.footer-links a {
  color: #7a9a7a;
  text-decoration: none;
  letter-spacing: 0.09em;
  font-size: 10.5px;
  font-weight: 500;
}
.footer-links a:hover { color: #2e7d32; }

/* ── ANIMATIONS ── */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .layout {
    gap: clamp(24px, 3vw, 32px);
  }
  
  .desk-image-wrapper {
    max-width: clamp(180px, 30vw, 260px);
  }
  
  .left-content {
    max-width: clamp(280px, 40vw, 500px);
  }
}

@media (max-width: 768px) {
  .layout {
    flex-direction: column;
    padding: clamp(20px, 5vw, 32px);
    gap: clamp(16px, 3vh, 24px);
    justify-content: flex-start;
  }
  
  .left-panel, .right-panel {
    width: 100%;
  }
  
  .left-content {
    max-width: 100%;
  }
  
  .desk-image-wrapper {
    max-width: clamp(150px, 50vw, 250px);
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-title {
    font-size: clamp(24px, 5vw, 42px);
    text-align: center;
  }
  
  .tagline-block {
    text-align: center;
    border-left: none;
    border-top: 3px solid #2e7d32;
    padding-left: 0;
    padding-top: 16px;
  }
  
  .login-card {
    max-width: 100%;
    padding: clamp(28px, 4vw, 40px);
  }
  
  .right-panel {
    min-height: auto;
  }
}

@media (max-width: 480px) {
  .layout {
    padding: clamp(16px, 4vw, 20px);
    gap: clamp(12px, 2vh, 16px);
  }
  
  .left-content {
    max-width: 100%;
  }
  
  .hero-title {
    font-size: clamp(20px, 5vw, 32px);
    margin-bottom: clamp(8px, 1.5vh, 12px);
  }
  
  .desk-image-wrapper {
    max-width: clamp(90px, 30vw, 150px);
  }
  
  .login-card {
    padding: clamp(24px, 4vw, 32px);
  }
  
  .form {
    gap: clamp(16px, 2vh, 20px);
  }
  
  .welcome-title {
    font-size: clamp(22px, 5vw, 32px);
  }
}

@media (max-height: 600px) {
  .layout {
    min-height: auto;
  }
  
  .left-panel,
  .right-panel {
    padding: clamp(12px, 2vh, 20px) 0;
  }
  
  .desk-image-wrapper {
    margin-bottom: clamp(4px, 1vh, 8px);
  }
  
  .hero-title {
    margin-bottom: clamp(8px, 1vh, 12px);
  }
}
</style>