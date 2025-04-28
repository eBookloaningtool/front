<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const userAvatar = ref('https://ui-avatars.com/api/?background=random');
const userName = ref('New User');
const userEmail = ref('');

onMounted(() => {
  // 获取用户名（假设在注册过程中存储）
  const name = localStorage.getItem('userName');
  if (name) {
    userName.value = name;
  }
  
  // 获取用户邮箱
  const email = localStorage.getItem('registeredEmail');
  if (email) {
    userEmail.value = email;
  }
});

// 导航到设置页面
const goToSettings = () => {
  router.push('/user/settings');
};

// 导航到个人中心
const goToPersonalCenter = () => {
  router.push('/user/center');
};
</script>

<template>
  <div class="profile-page min-h-screen bg-gray-50">
    <!-- 头部信息区域 -->
    <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-64 rounded-b-xl">
      <div class="container mx-auto px-4 py-10">
        <div class="flex justify-between items-center">
          <h1 class="text-white text-2xl font-medium">个人资料</h1>
          <button @click="goToSettings" class="bg-white bg-opacity-20 text-white py-2 px-4 rounded-lg hover:bg-opacity-30 transition">
            设置
          </button>
        </div>
      </div>
    </div>
    
    <!-- 个人资料卡片 -->
    <div class="container mx-auto px-4 -mt-24">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-8">
          <div class="flex flex-col md:flex-row items-center">
            <!-- 头像区域 -->
            <div class="flex-shrink-0">
              <div class="avatar-container">
                <img :src="userAvatar" alt="用户头像" class="avatar-image" />
              </div>
            </div>
            
            <!-- 用户信息区域 -->
            <div class="mt-6 md:mt-0 md:ml-8 text-center md:text-left">
              <h2 class="text-2xl font-semibold text-gray-800">{{ userName }}</h2>
              <p v-if="userEmail" class="text-gray-600 mt-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ userEmail }}
              </p>
              <p v-else class="text-gray-500 mt-1">新注册用户</p>
              <div class="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">读者</span>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">新用户</span>
              </div>
            </div>
          </div>
          
          <!-- 欢迎消息 -->
          <div class="mt-8 bg-blue-50 p-6 rounded-lg">
            <h3 class="text-lg font-medium text-blue-800">欢迎加入我们的电子书平台！</h3>
            <p class="mt-2 text-blue-600">
              您的账户已成功创建。现在您可以开始浏览和借阅我们丰富的电子书籍。
            </p>
            <button @click="goToPersonalCenter" class="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
              前往个人中心
            </button>
          </div>
          
          <!-- 快速操作区域 -->
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-800">借阅电子书</h4>
              <p class="text-sm text-gray-600 mt-1">浏览我们的电子书库，找到您感兴趣的书籍</p>
              <router-link to="/books" class="mt-2 inline-block text-blue-600 text-sm">探索书库 →</router-link>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-800">阅读历史</h4>
              <p class="text-sm text-gray-600 mt-1">查看您的阅读记录和阅读进度</p>
              <router-link to="/user/reading-duration" class="mt-2 inline-block text-blue-600 text-sm">查看历史 →</router-link>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h4 class="font-medium text-gray-800">心愿单</h4>
              <p class="text-sm text-gray-600 mt-1">管理您想要阅读的书籍清单</p>
              <router-link to="/user/wishlist" class="mt-2 inline-block text-blue-600 text-sm">查看心愿单 →</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.avatar-container {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 