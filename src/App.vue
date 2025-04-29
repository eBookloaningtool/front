<!-- App.vue -->
<template>
  <div id="app">
    <Header />
    <router-view></router-view>
    <ToastContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from './components/Header.vue'
import { checkAndSendDueSoonNotifications } from '@/utils/emailService'
import ToastContainer from './components/ToastContainer.vue'
import { useUserStore } from './stores/userStore'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  // 初始化用户状态
  userStore.initUserState()

  // 认证检查
  const publicPages = ['/login', '/register'] // 白名单路由
  const currentPath = router.currentRoute.value.path

  // 如果用户已登录且尝试访问登录或注册页面，重定向到首页
  if (userStore.isAuthenticated && publicPages.includes(currentPath)) {
    router.push('/')
  }

  // 检查即将到期的书籍并发送提醒
  if (userStore.isAuthenticated) {
    checkAndSendDueSoonNotifications().catch(err => {
      console.error('检查到期书籍失败:', err)
    })

    // 设置每日检查
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const timeUntilMidnight = tomorrow - now

    // 设置定时器在午夜执行检查
    setTimeout(() => {
      // 首次执行
      checkAndSendDueSoonNotifications()

      // 然后每24小时执行一次
      setInterval(() => {
        checkAndSendDueSoonNotifications()
      }, 24 * 60 * 60 * 1000)
    }, timeUntilMidnight)
  }
})

const goToBookDetail = (id) => {
  router.push({ name: 'BookDetail', params: { id } })
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background-color: #fffbf0;
  color: #333;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
}

img {
  max-width: 100%;
  display: block;
}

/* 响应式边距 */
@media (max-width: 768px) {
  #app {
    padding: 0 20px;
  }
}

@media (max-width: 480px) {
  #app {
    padding: 0 15px;
  }
}
</style>
