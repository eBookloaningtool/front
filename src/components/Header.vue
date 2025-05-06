<!-- Header.vue -->
<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <router-link to="/">
          <h1>BorrowBee</h1>
        </router-link>
      </div>

      <nav class="main-nav">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/categories">Categories</router-link></li>
          <li v-if="isLoggedIn"><router-link to="/user/books">My Books</router-link></li>
        </ul>
      </nav>

      <div class="search-container">
        <form @submit.prevent="handleSearch">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search books..."
            class="search-input"
          />
          <button type="submit" class="search-button">
            <i class="ri-search-line"></i>
          </button>
        </form>
      </div>

      <div class="user-actions">
        <template v-if="isLoggedIn">
          <router-link to="/cart" class="cart-btn" :class="{ 'has-items': cartItemCount > 0 }">
            <i :class="cartItemCount > 0 ? 'ri-shopping-cart-fill' : 'ri-shopping-cart-line'"></i>
            <span v-if="cartItemCount > 0" class="cart-counter">{{ cartItemCount }}</span>
          </router-link>
          <div class="user-profile" @click="toggleUserMenu">
            <i class="ri-user-line"></i>
            <div class="username">{{ username }}</div>
            <i class="ri-arrow-down-s-line"></i>

            <div class="user-menu" v-if="showUserMenu">
              <ul>
                <li><router-link to="/user/profile">Profile</router-link></li>
                <li><router-link to="/user/books">My Books</router-link></li>
                <li><a href="#" @click.prevent="logout">Logout</a></li>
              </ul>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <router-link to="/login" class="login-btn">Login</router-link>
            <router-link to="/register" class="register-btn">Register</router-link>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { cartAPI } from '../services/api'

const router = useRouter()
const userStore = useUserStore()
const showUserMenu = ref(false)
const searchQuery = ref('')
const cartItemCount = ref(0)

// 使用computed计算属性获取登录状态
const isLoggedIn = computed(() => userStore.isAuthenticated)
const username = computed(() => userStore.userName || 'User')

// 获取购物车商品数量
const fetchCartItemCount = async () => {
  if (isLoggedIn.value) {
    try {
      const response = await cartAPI.getCart()
      if (response.data && response.data.bookId && Array.isArray(response.data.bookId)) {
        cartItemCount.value = response.data.bookId.length
      } else {
        // 回退到localStorage
        try {
          const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
          cartItemCount.value = localCart.length
        } catch (err) {
          console.error('读取本地购物车数据失败:', err)
          cartItemCount.value = 0
        }
      }
    } catch (err) {
      console.error('获取购物车数据失败:', err)
      // 回退到localStorage
      try {
        const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
        cartItemCount.value = localCart.length
      } catch (err) {
        console.error('读取本地购物车数据失败:', err)
        cartItemCount.value = 0
      }
    }
  } else {
    cartItemCount.value = 0
  }
}

onMounted(() => {
  // 初始化用户状态
  userStore.initUserState()
  // 获取购物车数量
  fetchCartItemCount()

  // 监听localStorage变化，更新购物车数量
  window.addEventListener('storage', event => {
    if (event.key === 'cartItems') {
      fetchCartItemCount()
    }
  })

  // 自定义事件监听购物车变化
  document.addEventListener('cart-updated', () => {
    fetchCartItemCount()
  })
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const logout = async () => {
  try {
    await userStore.logout()
    showUserMenu.value = false
    router.push('/login')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { title: searchQuery.value.trim() }
    })
    searchQuery.value = ''
  }
}
</script>

<style scoped>
.header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
}

.logo h1 {
  font-size: 22px;
  font-weight: 600;
  color: #e9a84c;
  margin: 0;
}

.logo a {
  text-decoration: none;
}

.main-nav ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 25px;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.main-nav a:hover, .main-nav a.router-link-active {
  color: #e9a84c;
}

.search-container {
  position: relative;
  max-width: 300px;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 8px 35px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #e9a84c;
  box-shadow: 0 0 0 2px rgba(233, 168, 76, 0.2);
}

.search-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover {
  color: #e9a84c;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.login-btn, .register-btn {
  text-decoration: none;
  padding: 6px 15px;
  border-radius: 4px;
  transition: background 0.3s, color 0.3s;
}

.login-btn {
  color: #e9a84c;
  border: 1px solid #e9a84c;
}

.login-btn:hover {
  background: #fdf6e9;
}

.register-btn {
  background: #e9a84c;
  color: white;
}

.register-btn:hover {
  background: #d89638;
}

.cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: #333;
  transition: all 0.3s;
  text-decoration: none;
  position: relative;
}

.cart-btn.has-items {
  color: #e9a84c;
  animation: pulse 1s;
}

.cart-btn:hover {
  background: #f5f5f5;
  color: #e9a84c;
}

.cart-btn i {
  font-size: 20px;
}

.cart-counter {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #f44336;
  color: white;
  font-size: 10px;
  font-weight: bold;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
  padding: 6px 10px;
  border-radius: 4px;
}

.user-profile:hover {
  background: #f5f5f5;
}

.username {
  max-width: 100px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  width: 160px;
  margin-top: 5px;
  z-index: 10;
}

.user-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-menu li {
  border-bottom: 1px solid #f0f0f0;
}

.user-menu li:last-child {
  border-bottom: none;
}

.user-menu a {
  display: block;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  transition: background 0.3s;
}

.user-menu a:hover {
  background: #f5f5f5;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .main-nav {
    display: none;
  }

  .header-container {
    padding: 10px 20px;
  }
}
</style>
