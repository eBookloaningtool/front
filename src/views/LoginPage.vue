<script setup>
import LoginForm from '../components/LoginForm.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 登录成功后的跳转函数
const handleLoginSuccess = () => {
  // 登录成功后跳转到用户中心或首页
  router.push('/user/dashboard');
};
</script>

<template>
  <div class="login-page min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-6">
        <h1 class="text-3xl font-extrabold text-gray-900">Login</h1>
        <p class="mt-2 text-sm text-gray-600">
          Sign in to your account to start your reading journey
        </p>
      </div>
      
      <!-- Login Form -->
      <LoginForm @login-success="handleLoginSuccess" />
      
      <div class="text-center mt-4">
        <p class="text-sm text-gray-600">
          Don't have an account? 
          <router-link to="/register" class="text-amber-600 hover:text-amber-500">
            Register here
          </router-link>
        </p>
        <router-link to="/" class="block mt-2 text-sm text-amber-600 hover:text-amber-500">
          Back to home
        </router-link>
      </div>
    </div>
  </div>
</template> 