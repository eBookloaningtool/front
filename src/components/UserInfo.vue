<!-- src/components/UserInfo.vue -->
<template>
  <div class="user-info">
    <div class="user-avatar">
      <img :src="userInfo.avatar || '/images/default-avatar.png'" alt="用户头像" class="avatar-img" />
    </div>

    <h3 class="user-name">{{ userInfo.name }}</h3>
    <p class="user-email">{{ userInfo.email }}</p>

    <div class="user-meta">
      <div class="meta-item">
        <span class="meta-label">会员等级</span>
        <span class="meta-value">{{ userInfo.level || '普通会员' }}</span>
      </div>

      <div class="meta-item">
        <span class="meta-label">注册时间</span>
        <span class="meta-value">{{ userInfo.createdat || '未知' }}</span>
      </div>

      <div class="meta-item">
        <span class="meta-label">账户余额</span>
        <span class="meta-value balance-value">{{ userInfo.balance || 0 }} 元</span>
      </div>
    </div>

    <div class="user-actions">
      <router-link to="/user/topup" class="action-btn top-up-btn">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd" />
        </svg>
        Top Up
      </router-link>

      <button class="action-btn settings-btn">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
        Settings
      </button>

      <button class="action-btn logout-btn">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 2v4H5V5h5z" clip-rule="evenodd" />
        </svg>
        退出
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  userInfo: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 1rem;
  border: 3px solid #f0c080;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #3a3a3a;
}

.user-email {
  font-size: 0.9rem;
  color: #888;
  margin-bottom: 1.5rem;
}

.user-meta {
  width: 100%;
  margin-bottom: 1.5rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.meta-label {
  color: #888;
  font-size: 0.9rem;
}

.meta-value {
  font-weight: 600;
  color: #5a5a5a;
}

.balance-value {
  color: #f0c080;
  font-weight: 700;
}

.user-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  margin-top: 0.5rem;
}

.action-btn {
  flex: 1;
  min-width: calc(33% - 0.5rem);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
  cursor: pointer;
}

.top-up-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
}

.top-up-btn:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
}

.settings-btn {
  background-color: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.settings-btn:hover {
  background-color: #f3f4f6;
}

.logout-btn {
  background-color: #fff;
  color: #ef4444;
  border: 1px solid #ef4444;
}

.logout-btn:hover {
  background-color: #fef2f2;
}
</style>
