<template>
  <div class="min-h-screen bg-gray-50">
    <div class="flex pt-24">
      <!-- 左侧导航 -->
      <div class="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 pt-24">
        <!-- 用户信息 -->
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center mb-3">
            <div class="flex-shrink-0">
              <img
                :src="userStore.avatarUrl || defaultAvatarUrl"
                alt="用户头像"
                class="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-700">{{ userName }}</p>
            </div>
          </div>
        </div>

        <!-- 导航菜单 -->
        <nav class="mt-1">
          <ul>
            <li>
              <router-link
                to="/user/recent-borrows"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path.includes('recent-borrows') }"
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <i class="fas fa-book text-gray-500"></i>
                </span>
                当前在看
                <i class="fas fa-chevron-down ml-auto text-xs text-gray-400"></i>
              </router-link>
            </li>
            <li>
              <router-link
                to="/user/loan-history"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path.includes('loan-history') }"
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <i class="fas fa-history text-gray-500"></i>
                </span>
                借阅历史
                <i class="fas fa-chevron-down ml-auto text-xs text-gray-400"></i>
              </router-link>
            </li>
            <li>
              <router-link
                to="/user/reviews"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path.includes('reviews') }"
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <i class="fas fa-comment-alt text-gray-500"></i>
                </span>
                评论记录
                <i class="fas fa-chevron-down ml-auto text-xs text-gray-400"></i>
              </router-link>
            </li>
            <li>
              <router-link
                to="/user/wishlist"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path.includes('wishlist') }"
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <i class="fas fa-heart text-gray-500"></i>
                </span>
                愿望清单
                <i class="fas fa-chevron-down ml-auto text-xs text-gray-400"></i>
              </router-link>
            </li>
            <li>
              <router-link
                to="/user/payment-orders"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path.includes('payment') }"
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <i class="fas fa-credit-card text-gray-500"></i>
                </span>
                支付记录
                <i class="fas fa-chevron-down ml-auto text-xs text-gray-400"></i>
              </router-link>
            </li>
            <li>
              <router-link
                to="/user/profile"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path.includes('profile') }"
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <i class="fas fa-user-circle text-gray-500"></i>
                </span>
                个人中心
                <i class="fas fa-chevron-down ml-auto text-xs text-gray-400"></i>
              </router-link>
            </li>
            <li>
              <router-link
                to="/user/settings"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
                :class="{ 'bg-gray-100': $route.path.includes('settings') }"
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <i class="fas fa-cog text-gray-500"></i>
                </span>
                设置
                <i class="fas fa-chevron-down ml-auto text-xs text-gray-400"></i>
              </router-link>
            </li>
            <li>
              <router-link
                to="/"
                class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100"
              >
                <span class="inline-flex items-center justify-center w-5 h-5 mr-3">
                  <i class="fas fa-exclamation-circle text-gray-500"></i>
                </span>
                异常页
                <i class="fas fa-chevron-down ml-auto text-xs text-gray-400"></i>
              </router-link>
            </li>
          </ul>
        </nav>
      </div>

      <!-- 右侧内容区域 -->
      <div class="ml-64 flex-1 p-6">
        <!-- 面包屑导航 -->
        <div class="mb-4 flex items-center text-gray-500 text-sm">
          <router-link to="/" class="hover:text-blue-500">
            <i class="fas fa-home mr-1"></i>
          </router-link>
          <span class="mx-1">/</span>
          <router-link to="/user/profile" class="hover:text-blue-500">个人中心</router-link>
          <span class="mx-1">/</span>
          <span class="text-gray-700">{{ currentPageTitle }}</span>
        </div>

        <!-- 内容区域 -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../stores/userStore';

const route = useRoute();
const userStore = useUserStore();

const userName = ref('');

// 备用默认头像
const defaultAvatarUrl = computed(() => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value || 'User')}&background=random`;
});

// 根据路由路径返回当前页面标题
const currentPageTitle = computed(() => {
  const path = route.path;
  if (path.includes('profile')) return '用户设置';
  if (path.includes('recent-borrows')) return '当前在看';
  if (path.includes('loan-history')) return '借阅历史';
  if (path.includes('reviews')) return '评论记录';
  if (path.includes('wishlist')) return '愿望清单';
  if (path.includes('payment')) return '支付记录';
  if (path.includes('settings')) return '设置';
  return '个人中心';
});

onMounted(() => {
  // 获取用户名
  const name = localStorage.getItem('userName');
  if (name) {
    userName.value = name;
  }

  // 确保头像生成
  const uuid = localStorage.getItem('uuid');
  if (!userStore.avatarUrl && uuid) {
    userStore.avatarUrl = userStore.generateAvatarUrl(uuid);
  }
});
</script>

<style scoped>
/* 自定义样式 */
.router-link-active {
  color: #4f46e5; /* indigo-600 */
}
</style>
