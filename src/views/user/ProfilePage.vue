<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import axios from 'axios';
import { getBookDetail } from '../../api/books';

const router = useRouter();
const userStore = useUserStore();

const user = ref(null);
const borrowedBooks = ref([]);
const loading = ref(true);
const error = ref('');

// 使用计算属性从userStore获取用户信息
const userName = computed(() => userStore.userName || 'New User');
const userEmail = computed(() => userStore.userEmail || '');
const userAvatar = computed(() => `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}&background=random`);

// 获取借阅列表
const fetchBorrowedBooks = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // 获取借阅列表
    const response = await axios.post('/api/borrow/borrowlist/', {}, {
      headers: {
        Authorization: `Bearer ${userStore.token}`
      }
    });
    
    if (response.data.state === 'success' && response.data.data) {
      // 获取每本书的详细信息
      const bookDetails = await Promise.all(
        response.data.data.map(async (borrow) => {
          const bookDetail = await getBookDetail(borrow.bookId);
          if (bookDetail) {
            return {
              ...bookDetail,
              borrowDate: borrow.borrowDate,
              dueDate: borrow.dueDate,
              borrowId: borrow.borrowId
            };
          }
          return null;
        })
      );
      
      // 过滤掉获取失败的书籍
      borrowedBooks.value = bookDetails.filter(book => book !== null);
    } else {
      borrowedBooks.value = [];
    }
  } catch (err) {
    console.error('获取借阅列表失败:', err);
    error.value = '获取借阅列表失败，请稍后重试';
    borrowedBooks.value = [];
  } finally {
    loading.value = false;
  }
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 计算剩余天数
const getRemainingDays = (dueDate) => {
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// 获取状态样式
const getStatusClass = (dueDate) => {
  const remainingDays = getRemainingDays(dueDate);
  if (remainingDays < 0) {
    return 'text-red-500';
  } else if (remainingDays <= 3) {
    return 'text-orange-500';
  }
  return 'text-green-500';
};

// 获取状态文本
const getStatusText = (dueDate) => {
  const remainingDays = getRemainingDays(dueDate);
  if (remainingDays < 0) {
    return `已逾期 ${Math.abs(remainingDays)} 天`;
  } else if (remainingDays === 0) {
    return '今天到期';
  } else if (remainingDays <= 3) {
    return `还剩 ${remainingDays} 天到期`;
  }
  return `还剩 ${remainingDays} 天到期`;
};

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  user.value = userStore.user;
  await fetchBorrowedBooks();
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
          
          <!-- 当前借阅区域 -->
          <div class="mt-8">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">当前借阅</h3>
            
            <!-- 加载状态 -->
            <div v-if="loading" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            
            <!-- 错误信息 -->
            <div v-else-if="error" class="bg-red-50 text-red-600 p-4 rounded-lg">
              {{ error }}
              <button @click="fetchBorrowedBooks" class="ml-4 text-red-800 underline">重试</button>
            </div>
            
            <!-- 借阅列表 -->
            <div v-else-if="borrowedBooks.length > 0" class="space-y-4">
              <div v-for="book in borrowedBooks" :key="book.borrowId" class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-start">
                  <!-- 书籍封面 -->
                  <img :src="book.coverUrl" :alt="book.title" class="w-20 h-28 object-cover rounded shadow-md" />
                  
                  <!-- 书籍信息 -->
                  <div class="ml-4 flex-1">
                    <h4 class="font-medium text-gray-800">{{ book.title }}</h4>
                    <p class="text-sm text-gray-600">{{ book.author }}</p>
                    
                    <!-- 借阅信息 -->
                    <div class="mt-2 text-sm">
                      <p class="text-gray-600">借阅日期：{{ formatDate(book.borrowDate) }}</p>
                      <p class="text-gray-600">到期日期：{{ formatDate(book.dueDate) }}</p>
                      <p :class="getStatusClass(book.dueDate)" class="font-medium">
                        {{ getStatusText(book.dueDate) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 无借阅提示 -->
            <div v-else class="text-center py-8 text-gray-500">
              暂无借阅的书籍
            </div>
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