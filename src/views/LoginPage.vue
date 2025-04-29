<script setup>
import LoginForm from '../components/LoginForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Login success redirect function
const handleLoginSuccess = () => {
  // Redirect to homepage after login
  router.push('/');
};
</script>

<template>
  <div class="login-page min-h-screen flex flex-col items-center justify-center bg-blur">
    <div class="overlay"></div>
    <div class="login-container relative z-10">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-extrabold text-gray-800">BorrowBee</h1>
      </div>

      <div class="tab-container text-center mb-10">
        <span class="tab active">Log in</span>
        <span class="tab">
          <router-link to="/register" class="text-gray-500 hover:text-gray-700">
            Register
          </router-link>
        </span>
      </div>

      <!-- Login Form -->
      <LoginForm @login-success="handleLoginSuccess" />
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  overflow: hidden;
}

.bg-blur {
  background-image: url('/src/assets/images/background.jpg');
  background-size: cover;
  background-position: center;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  z-index: 1;
}

.login-container {
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
}

.tab-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
  padding-top: 0.75rem;
}

.tab {
  padding-bottom: 0.75rem;
  font-size: 1.1rem;
  cursor: pointer;
  position: relative;
}

.tab.active {
  color: #f59e0b;
  font-weight: 500;
}

.tab.active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #f59e0b;
}
</style>