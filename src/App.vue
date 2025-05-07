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

onMounted(async () => {
  // Initialize user state
  await userStore.initUserState()

  // Authentication check
  const publicPages = ['/login', '/register'] // Whitelist routes
  const currentPath = router.currentRoute.value.path

  // If user is logged in and trying to access login or register page, redirect to home
  if (userStore.isAuthenticated && publicPages.includes(currentPath)) {
    router.push('/')
  }

  // Check for books nearing due date and send reminders
  if (userStore.isAuthenticated) {
    checkAndSendDueSoonNotifications().catch(err => {
      console.error('Failed to check due books:', err)
    })

    // Set up daily check
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const timeUntilMidnight = tomorrow - now

    // Set timer to check at midnight
    setTimeout(() => {
      // First execution
      checkAndSendDueSoonNotifications()

      // Then execute every 24 hours
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

/* Responsive margins */
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
