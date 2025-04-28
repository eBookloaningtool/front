<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- 基本设置卡片 -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">个人资料设置</h1>
        </div>
        <div class="p-6">
          <!-- 设置表单 -->
          <form @submit.prevent="saveSettings">
            <!-- 消息提示 -->
            <div v-if="message.show" class="mb-4 p-4 rounded-md transition-all duration-300" :class="message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
              {{ message.text }}
            </div>
            
            <div class="mb-4">
              <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
              <input
                type="text"
                id="username"
                v-model="username"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                id="email"
                v-model="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div class="mb-4">
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">手机号码</label>
              <input
                type="tel"
                id="phone"
                v-model="phone"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div class="mt-6">
              <button
                type="submit"
                class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">保存中...</span>
                <span v-else>保存设置</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <!-- 密码修改卡片 -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">修改密码</h1>
        </div>
        <div class="p-6">
          <!-- 密码修改表单 -->
          <form @submit.prevent="changePassword">
            <!-- 密码修改消息提示 -->
            <div v-if="passwordMessage.show" class="mb-4 p-4 rounded-md transition-all duration-300" :class="passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
              {{ passwordMessage.text }}
            </div>
            
            <div class="mb-4">
              <label for="currentPassword" class="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
              <input
                type="password"
                id="currentPassword"
                v-model="currentPassword"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入当前密码"
              />
            </div>
            
            <div class="mb-4">
              <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
              <input
                type="password"
                id="newPassword"
                v-model="newPassword"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入新密码"
              />
            </div>
            
            <div class="mb-4">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="再次输入新密码"
              />
            </div>
            
            <div class="mt-6">
              <button
                type="submit"
                class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :disabled="isPasswordSubmitting"
              >
                <span v-if="isPasswordSubmitting">修改中...</span>
                <span v-else>修改密码</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import mockAPI from '../../mock-api.js';

// 模拟用户数据
const username = ref('用户名');
const email = ref('user@example.com');
const phone = ref('1388888XXXX');
const isSubmitting = ref(false);
const message = ref({ show: false, text: '', type: '' });

// 密码修改相关
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isPasswordSubmitting = ref(false);
const passwordMessage = ref({ show: false, text: '', type: '' });

// 显示消息并自动隐藏
const showMessage = (msgObj, text, type) => {
  msgObj.text = text;
  msgObj.type = type;
  msgObj.show = true;
  
  setTimeout(() => {
    msgObj.show = false;
  }, 3000);
};

// 保存设置
const saveSettings = async () => {
  try {
    isSubmitting.value = true;
    
    // 调用API保存设置
    // const response = await mockAPI.post('/api/user/update', {
    //   name: username.value,
    //   email: email.value,
    //   phone: phone.value
    // }, {
    //   Authorization: `Bearer ${localStorage.getItem('token')}`
    // });
    
    // 模拟API调用成功
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showMessage(message, '设置已保存', 'success');
  } catch (error) {
    console.error('保存设置失败:', error);
    showMessage(message, '保存设置失败，请稍后再试', 'error');
  } finally {
    isSubmitting.value = false;
  }
};

// 修改密码
const changePassword = async () => {
  // 表单验证
  if (!currentPassword.value) {
    showMessage(passwordMessage, '请输入当前密码', 'error');
    return;
  }
  
  if (!newPassword.value) {
    showMessage(passwordMessage, '请输入新密码', 'error');
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    showMessage(passwordMessage, '两次输入的新密码不一致', 'error');
    return;
  }
  
  if (newPassword.value.length < 6) {
    showMessage(passwordMessage, '新密码长度不能少于6个字符', 'error');
    return;
  }
  
  try {
    isPasswordSubmitting.value = true;
    
    // 获取当前登录的邮箱
    const userEmail = localStorage.getItem('registeredEmail') || email.value;
    
    // 调用修改密码API
    const response = await mockAPI.post('/api/user/change-password', {
      email: userEmail,
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    }, {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
    
    if (response.state === 'success') {
      showMessage(passwordMessage, '密码修改成功', 'success');
      
      // 清空密码输入框
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
    } else {
      showMessage(passwordMessage, response.message || '密码修改失败', 'error');
    }
  } catch (error) {
    console.error('修改密码失败:', error);
    showMessage(passwordMessage, '修改密码失败，请稍后再试', 'error');
  } finally {
    isPasswordSubmitting.value = false;
  }
};
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style> 