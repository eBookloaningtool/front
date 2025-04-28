<!-- src/views/UserDashboard.vue -->
<template>
  <div class="dashboard-container">
    <Header />
    <div class="dashboard-content">
      <h1 class="dashboard-title">个人中心</h1>
      
      <div class="dashboard-grid">
        <div class="dashboard-sidebar">
          <UserInfo :userInfo="userInfo" />
        </div>
        
        <div class="dashboard-main">
          <div class="dashboard-section">
            <h2 class="section-title">已借阅书籍</h2>
            <BorrowedBooks 
              :bookIds="userInfo.borrowedBooks" 
              v-if="userInfo.borrowedBooks && userInfo.borrowedBooks.length > 0" 
            />
            <div class="empty-state" v-else>
              <p>您还没有借阅任何书籍</p>
              <router-link to="/" class="btn-primary">浏览图书馆</router-link>
            </div>
          </div>

          <div class="dashboard-section">
            <h2 class="section-title">愿望清单</h2>
            <Wishlist 
              :bookIds="userInfo.wishlist" 
              v-if="userInfo.wishlist && userInfo.wishlist.length > 0" 
            />
            <div class="empty-state" v-else>
              <p>您的愿望清单为空</p>
              <router-link to="/" class="btn-primary">添加书籍</router-link>
            </div>
          </div>

          <div class="dashboard-section">
            <h2 class="section-title">历史阅读</h2>
            <HistoricalBooks 
              :bookIds="userInfo.historicalBooks" 
              v-if="userInfo.historicalBooks && userInfo.historicalBooks.length > 0" 
            />
            <div class="empty-state" v-else>
              <p>您还没有阅读记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Header from '../components/Header.vue';
import Footer from '../components/Footer.vue';
import UserInfo from '../components/UserInfo.vue';
import BorrowedBooks from '../components/BorrowedBooks.vue';
import Wishlist from '../components/Wishlist.vue';
import HistoricalBooks from '../components/HistoricalBooks.vue';

const router = useRouter();
const userInfo = ref({});
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  // 检查用户是否已登录
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/login');
    return;
  }

  try {
    loading.value = true;
    // 获取用户信息
    const response = await fetch('/api/users/info', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    const data = await response.json();
    userInfo.value = data;
  } catch (err) {
    error.value = err.message;
    console.error('获取用户信息出错:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  width: 100%;
}

.dashboard-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #3a3a3a;
  border-bottom: 2px solid #f0c080;
  padding-bottom: 0.5rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.dashboard-sidebar {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  height: fit-content;
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-section {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #5a5a5a;
  display: flex;
  align-items: center;
}

.section-title::after {
  content: '';
  flex-grow: 1;
  height: 1px;
  background-color: #e0e0e0;
  margin-left: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
}

.btn-primary {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #f0c080;
  color: #fff;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #e0a060;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-sidebar {
    order: 2;
  }
  
  .dashboard-main {
    order: 1;
  }
}
</style> 