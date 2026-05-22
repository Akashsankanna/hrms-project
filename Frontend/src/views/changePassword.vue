<template>
  <div class="page">

    <div class="center-card">

      <h2 class="welcome-title">Set New Password</h2>

      <p class="subtitle">
        Create a secure password to continue
      </p>

      <div class="form">

        <input 
          v-model="newPassword" 
          type="password"
          placeholder="New Password" 
          class="field-input"
        />

        <input 
          v-model="confirmPassword" 
          type="password"
          placeholder="Confirm Password" 
          class="field-input"
        />

        <p v-if="message" class="error-text">
          {{ message }}
        </p>

        <button class="signin-btn" @click="handlePasswordReset">
          Update Password
        </button>

      </div>

    </div>

  </div>
</template>

<script>
import { authAPI } from '@/services/api'   // ✅ IMPORT API
export default {
  name: 'ChangePassword',

  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      message: ''
    };
  },

  methods: {
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
.page {
  min-height: 100vh;
  background: #d3f1d7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-card {
  background: #fff;
  padding: 80px 60px;
  border-radius: 28px;
  width: 100%;
  max-width: 480px;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 12px 50px rgba(0,0,0,0.1);
  animation: fadeInUp 0.6s ease;
}

.welcome-title {
  text-align: center;
  font-family: "Times New Roman", serif;
  margin-bottom: 10px;
  font-size: 28px;
}

.subtitle {
  text-align: center;
  color: #6a8a6a;
  margin-bottom: 25px;
  font-size: 14px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.field-input {
  height: 52px;
  border-radius: 12px;
  border: 1px solid #dce8dc;
  padding: 0 16px;
  font-size: 14px;
}

.signin-btn {
  height: 54px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
}

.error-text {
  text-align: center;
  color: #d32f2f;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>