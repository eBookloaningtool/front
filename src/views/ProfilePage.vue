<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <!-- 用户资料卡片 -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <!-- 头部：用户头像和基本信息 -->
        <div class="p-6 bg-gradient-to-r from-amber-500 to-amber-600">
          <div class="flex flex-col sm:flex-row items-center sm:items-start">
            <div class="flex-shrink-0 mb-4 sm:mb-0">
              <div class="w-24 h-24 rounded-full bg-white p-1">
                <img
                  :src="avatarUrl"
                  :alt="username"
                  class="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
            <div class="ml-0 sm:ml-6 text-center sm:text-left">
              <h1 class="text-xl font-bold text-white">{{ username }}</h1>
              <p class="text-amber-100">{{ email }}</p>
              <div class="mt-3 flex flex-col sm:flex-row sm:space-x-4 text-sm">
                <p class="text-amber-100">注册时间：{{ registrationDate }}</p>
                <p class="text-amber-100 mt-1 sm:mt-0">账户余额：￡{{ balance }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 功能列表 -->
        <div class="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <router-link :to="{ name: 'RecentBorrows' }"
            class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <span class="ml-3 text-gray-700">当前借阅</span>
          </router-link>

          <router-link :to="{ name: 'LoanHistory' }"
            class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="ml-3 text-gray-700">借阅历史</span>
          </router-link>

          <router-link :to="{ name: 'Favorites' }"
            class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="ml-3 text-gray-700">我的收藏</span>
          </router-link>

          <router-link :to="{ name: 'Wishlist' }"
            class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span class="ml-3 text-gray-700">愿望清单</span>
          </router-link>

          <router-link :to="{ name: 'Settings' }"
            class="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
              </svg>
            </div>
            <span class="ml-3 text-gray-700">设置</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userAPI } from '../services/api';

const router = useRouter();

const username = ref('');
const email = ref('');
const registrationDate = ref('');
const balance = ref('0.00');
const userId = ref('');

// 头像保持默认生成逻辑
const avatarUrl = computed(() => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username.value)}&background=random`;
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知';
  const d = new Date(dateStr);
  if (isNaN(d)) return '未知';
  return d.toISOString().split('T')[0];
};

// 拉取用户信息
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await userAPI.getUserInfo();

    const data = response.data;

    username.value = data.name || '未命名用户';
    email.value = data.email || '未知邮箱';
    registrationDate.value = formatDate(data.createdat);
    balance.value = parseFloat(data.balance || 0).toFixed(2);

    // 额外安全保存UUID
    if (data.UUID) {
      userId.value = data.UUID;
      localStorage.setItem('uuid', data.UUID);
    }

  } catch (error) {
    console.error('获取用户资料失败:', error);

    if (error.response && error.response.status === 401) {
      // 认证失败，清除token
      localStorage.removeItem('token');
      router.push('/login');
    } else {
      alert('加载用户信息失败，请稍后再试');
    }
  }
};

// 页面加载时强制拉一次数据
onMounted(() => {
  fetchUserProfile();
});
</script>

<style scoped>
.profile-page {
  padding: 120px 0 80px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 28px;
  margin-bottom: 30px;
  color: #333;
}

.profile-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.profile-info {
  display: flex;
  margin-bottom: 40px;
  gap: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details h2 {
  margin-bottom: 10px;
  font-size: 22px;
}

.user-details p {
  color: #666;
  margin-bottom: 5px;
}

.settings-section {
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.settings-section h3 {
  margin-bottom: 20px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.save-btn {
  background: #e9a84c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.save-btn:hover {
  background: #d89638;
}

@media (max-width: 600px) {
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
