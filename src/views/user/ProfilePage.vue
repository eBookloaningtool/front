<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../../stores/userStore';
import UserLayout from '../../layouts/UserLayout.vue';

const router = useRouter();
const userStore = useUserStore();
const userName = ref('dsfuis'); // 从截图中获取的用户名
const userEmail = ref('');
const registrationDate = ref('2021-06-30'); // 从截图中获取的注册日期
const activeTab = ref('basic'); // 默认显示基础信息标签页

// 计算用户余额，保留两位小数
const userBalance = computed(() => {
  return userStore.balance.toFixed(2);
});

// 备用默认头像，只有在userStore中没有头像时使用
const defaultAvatarUrl = computed(() => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value || 'User')}&background=random`;
});

onMounted(() => {
  // 初始化用户状态
  userStore.initUserState();

  // 获取用户名
  const name = localStorage.getItem('userName');
  if (name) {
    userName.value = name;
  } else if (userStore.userName) {
    userName.value = userStore.userName;
  }

  // 获取用户邮箱
  const email = localStorage.getItem('registeredEmail');
  if (email) {
    userEmail.value = email;
  } else if (userStore.userEmail) {
    userEmail.value = userStore.userEmail;
  }

  // 设置样例余额（如果没有）
  if (!localStorage.getItem('userBalance')) {
    localStorage.setItem('userBalance', '0.00');
    userStore.updateBalance(0);
  }

  // 确保头像生成
  const uuid = localStorage.getItem('uuid');
  if (!userStore.avatarUrl && uuid) {
    userStore.avatarUrl = userStore.generateAvatarUrl(uuid);
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
  <UserLayout>
    <!-- 用户设置内容区域 -->
    <div class="bg-white rounded-lg shadow">
      <!-- 标签页导航 -->
      <div class="flex border-b border-gray-200">
        <button
          @click="activeTab = 'basic'"
          class="px-6 py-4 text-sm font-medium"
          :class="activeTab === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
        >
          基础信息
        </button>
        <button
          @click="activeTab = 'security'"
          class="px-6 py-4 text-sm font-medium"
          :class="activeTab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
        >
          安全设置
        </button>
        <button
          @click="activeTab = 'verify'"
          class="px-6 py-4 text-sm font-medium"
          :class="activeTab === 'verify' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
        >
          实名认证
        </button>
      </div>

      <!-- 基础信息标签页内容 -->
      <div v-if="activeTab === 'basic'" class="p-6">
        <div class="border-b border-gray-200 py-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-gray-700 mb-1">用户名：</div>
              <div class="text-gray-900">{{ userName }}</div>
            </div>
          </div>
        </div>

        <div class="border-b border-gray-200 py-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-gray-700 mb-1">账号邮箱：</div>
              <div class="text-gray-900">{{ userEmail || '未设置' }}</div>
            </div>
          </div>
        </div>

        <div class="border-b border-gray-200 py-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-gray-700 mb-1">账号余额：</div>
              <div class="text-gray-900">{{ userBalance }} 元</div>
            </div>
          </div>
        </div>

        <div class="py-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-gray-700 mb-1">注册时间：</div>
              <div class="text-gray-900">{{ registrationDate || '未知' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 安全设置标签页内容 -->
      <div v-if="activeTab === 'security'" class="p-6">
        <div class="border-b border-gray-200 py-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-gray-900 font-medium">登录密码</div>
              <div class="text-gray-500 text-sm mt-1">已设置，密码至少6位字符，支持数字、字母和除空格外的特殊字符，且必须同时包含数字和大小写字母。</div>
            </div>
            <button class="text-blue-600 hover:text-blue-700">修改</button>
          </div>
        </div>

        <div class="border-b border-gray-200 py-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-gray-900 font-medium">安全邮箱</div>
              <div class="text-gray-500 text-sm mt-1">{{ userEmail ? `已绑定: ${userEmail}` : '您暂未设置邮箱，绑定后可以用来接收通知、找回密码等。' }}</div>
            </div>
            <button class="text-blue-600 hover:text-blue-700">{{ userEmail ? '修改' : '设置' }}</button>
          </div>
        </div>

        <div class="py-4">
          <div class="flex justify-between items-center">
            <div>
              <div class="text-gray-900 font-medium">安全手机</div>
              <div class="text-gray-500 text-sm mt-1">已绑定: 150******50</div>
            </div>
            <button class="text-blue-600 hover:text-blue-700">修改</button>
          </div>
        </div>
      </div>

      <!-- 实名认证标签页内容 -->
      <div v-if="activeTab === 'verify'" class="p-6">
        <p class="text-gray-500 text-center py-12">您尚未进行实名认证</p>
      </div>
    </div>
  </UserLayout>
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

/* 确保页面内容在中间 */
.container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
