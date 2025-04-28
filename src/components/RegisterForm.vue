<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import mockAPI from '../mock-api.js';

const router = useRouter();

// 表单数据
const name = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const registerSuccess = ref(false);

// 简单验证
const validateForm = () => {
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = '请填写所有字段';
    return false;
  }
  
  // 邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    errorMessage.value = '请输入有效的邮箱地址';
    return false;
  }
  
  // 密码长度验证
  if (password.value.length < 6) {
    errorMessage.value = '密码长度至少为6个字符';
    return false;
  }
  
  return true;
};

// 提交注册
const handleSubmit = async () => {
  try {
    // 重置错误信息
    errorMessage.value = '';
    
    // 表单验证
    if (!validateForm()) {
      return;
    }
    
    isSubmitting.value = true;
    
    // 构建请求数据
    const userData = {
      name: name.value,
      email: email.value,
      password: password.value
    };
    
    // 使用模拟API发送注册请求
    const data = await mockAPI.post('/api/auth/register', userData);
    
    if (data.state === 'success') {
      // 注册成功
      registerSuccess.value = true;
      
      // 缓存登录信息，方便用户直接登录
      localStorage.setItem('registeredEmail', email.value);
      localStorage.setItem('userName', name.value);
      
      // 触发注册成功事件
      emit('registration-success', {
        name: name.value,
        email: email.value
      });
    } else {
      // 处理失败情况
      errorMessage.value = data.message || '注册失败，请稍后重试';
    }
  } catch (error) {
    console.error('注册请求出错:', error);
    errorMessage.value = '注册过程中出错，请稍后重试';
  } finally {
    isSubmitting.value = false;
  }
};

// 定义emit事件
const emit = defineEmits(['registration-success']);
</script>

<template>
  <div class="register-form-container p-8 bg-white rounded-xl shadow-sm border border-gray-100">
    <h2 class="text-xl font-medium mb-8 text-center text-gray-700">用户注册</h2>
    
    <!-- 注册成功信息 -->
    <div v-if="registerSuccess" class="success-message text-center py-8">
      <div class="success-icon mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-medium text-gray-800 mb-2">注册成功！</h3>
      <p class="text-sm text-gray-600">正在跳转到登录页面...</p>
    </div>
    
    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 错误信息展示 -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg mb-6 text-center text-sm transition-all duration-300" role="alert">
        {{ errorMessage }}
      </div>
      
      <!-- 姓名输入框 -->
      <div class="form-group">
        <label for="name" class="block text-sm font-normal text-gray-600 mb-2 text-center">姓名</label>
        <div class="relative rounded-md">
          <input
            id="name"
            v-model="name"
            type="text"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-colors text-center"
            placeholder="请输入您的姓名"
            required
          />
        </div>
      </div>
      
      <!-- 邮箱输入框 -->
      <div class="form-group">
        <label for="email" class="block text-sm font-normal text-gray-600 mb-2 text-center">邮箱</label>
        <div class="relative rounded-md">
          <input
            id="email"
            v-model="email"
            type="email"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-colors text-center"
            placeholder="请输入您的邮箱"
            required
          />
        </div>
      </div>
      
      <!-- 密码输入框 -->
      <div class="form-group">
        <label for="password" class="block text-sm font-normal text-gray-600 mb-2 text-center">密码</label>
        <div class="relative rounded-md">
          <input
            id="password"
            v-model="password"
            type="password"
            class="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 focus:bg-white transition-colors text-center"
            placeholder="请设置密码"
            required
          />
        </div>
        <p class="mt-2 text-xs text-gray-400 text-center">密码至少需要6位字符</p>
      </div>
      
      <!-- 注册按钮 -->
      <button
        type="submit"
        class="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-normal rounded-lg transition-colors duration-300 mt-8"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          注册中...
        </span>
        <span v-else>注册</span>
      </button>
      
      <!-- 已有账号？前往登录 -->
      <div class="text-center mt-6">
        <router-link to="/login" class="text-blue-500 hover:text-blue-600 text-sm transition-colors">
          已有账号？点击登录
        </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.register-form-container {
  animation: fadeIn 0.6s ease-out;
  transition: all 0.3s ease;
}

.success-message {
  animation: successFadeIn 0.5s ease-out;
}

@keyframes successFadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.success-icon {
  animation: iconPop 0.5s ease-out 0.2s both;
  transform-origin: center;
}

@keyframes iconPop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

input::placeholder {
  color: #CBD5E0;
}
</style> 