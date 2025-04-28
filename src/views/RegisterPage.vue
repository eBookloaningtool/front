<script setup>
import RegisterForm from '../components/RegisterForm.vue';
import { useRouter } from 'vue-router';
import { ref, reactive, computed } from 'vue';

const router = useRouter();

// 注册成功后的回调函数
const handleRegistrationSuccess = (userData) => {
  // 存储其他用户信息
  if (userData.email) {
    localStorage.setItem('registeredEmail', userData.email);
  }
  if (userData.name) {
    localStorage.setItem('userName', userData.name);
  }
  
  // 显示成功消息
  alert('注册成功！正在跳转到个人资料页面...');
  
  // 延迟跳转到用户资料页面
  setTimeout(() => {
    router.push('/user/profile');
  }, 1500);
};
</script>

<template>
  <div class="register-page min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-16 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-sm mx-auto">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-extralight text-gray-800">Welcome</h1>
        <p class="mt-4 text-sm text-gray-500">
          Create your account to start using our services
        </p>
      </div>
      
      <!-- Registration Form Component -->
      <RegisterForm @registration-success="handleRegistrationSuccess" />
      
      <!-- Footer Information -->
      <div class="mt-10 text-center text-xs text-gray-400">
        <p>By registering, you agree to our <span class="text-blue-500 hover:text-blue-600 cursor-pointer transition-colors">Terms of Service</span> and <span class="text-blue-500 hover:text-blue-600 cursor-pointer transition-colors">Privacy Policy</span></p>
        <div class="mt-4">
          <p>已有账号? <router-link to="/login" class="text-blue-500 hover:text-blue-600 transition-colors">登录</router-link></p>
        </div>
      </div>
    </div>
    
    <!-- Decorative Elements - Softer Effects -->
    <div class="absolute top-10 left-10 w-48 h-48 bg-blue-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob-slow"></div>
    <div class="absolute bottom-10 right-10 w-48 h-48 bg-indigo-50 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob-slow animation-delay-3000"></div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #f7fafc;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

@keyframes blob-slow {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(20px, -20px) scale(1.05);
  }
  66% {
    transform: translate(-10px, 10px) scale(0.95);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob-slow {
  animation: blob-slow 15s infinite ease;
}

.animation-delay-3000 {
  animation-delay: 3s;
}

.hidden-input {
  display: none;
}
</style> 