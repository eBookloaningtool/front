<!-- Header.vue -->
<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <router-link to="/" @click="closeUserMenu">
          <h1>BorrowBee</h1>
        </router-link>
      </div>

      <nav class="main-nav">
        <ul>
          <li><router-link to="/" @click="closeUserMenu">Home</router-link></li>
          <li><router-link to="/categories" @click="closeUserMenu">Categories</router-link></li>
          <li v-if="isLoggedIn"><router-link to="/user/books" @click="closeUserMenu">My Books</router-link></li>
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
          <!-- Wishlist Button -->
          <router-link to="/user/profile?view=Wishlist" class="wishlist-btn" :class="{ 'has-items': wishlistItemCount > 0 }" @click="closeUserMenu">
            <i :class="wishlistItemCount > 0 ? 'ri-heart-fill' : 'ri-heart-line'"></i>
            <span v-if="wishlistItemCount > 0" class="wishlist-counter">{{ wishlistItemCount }}</span>
          </router-link>

          <router-link to="/cart" class="cart-btn" :class="{ 'has-items': cartItemCount > 0 }" @click="closeUserMenu">
            <i :class="cartItemCount > 0 ? 'ri-shopping-cart-fill' : 'ri-shopping-cart-line'"></i>
            <span v-if="cartItemCount > 0" class="cart-counter">{{ cartItemCount }}</span>
          </router-link>
          <div ref="userMenuRef" class="user-profile" @click.stop="toggleUserMenu">
            <i class="ri-user-line"></i>
            <div class="username">{{ username }}</div>
            <i class="ri-arrow-down-s-line"></i>

            <div class="user-menu" v-if="showUserMenu" @click.stop>
              <ul>
                <li><router-link to="/user/profile" @click.stop.prevent="navigateTo('/user/profile')">Profile</router-link></li>
                <li><router-link to="/user/books" @click.stop.prevent="navigateTo('/user/books')">My Books</router-link></li>
                <li><a href="#" @click.stop.prevent="logout">Logout</a></li>
              </ul>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="auth-buttons">
            <router-link to="/login" class="login-btn" @click="closeUserMenu">Login</router-link>
            <router-link to="/register" class="register-btn" @click="closeUserMenu">Register</router-link>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { cartAPI } from '../services/api'
import { getWishlist } from '../api/booksApi'

const router = useRouter()
const userStore = useUserStore()
const showUserMenu = ref(false)
const searchQuery = ref('')
const cartItemCount = ref(0)
const wishlistItemCount = ref(0)
const userMenuRef = ref(null)

// Using computed properties to get login status
const isLoggedIn = computed(() => userStore.isAuthenticated)
const username = computed(() => userStore.userName || 'User')

// Create a method to close the user menu
const closeUserMenu = () => {
  showUserMenu.value = false
}

// Handle clicks outside the menu
const handleOutsideClick = (event) => {
  // If the menu is not displayed, do nothing
  if (!showUserMenu.value) return;

  // Check if the click is outside the user menu area
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    // Add a short delay to ensure other click events are completed
    setTimeout(() => {
      closeUserMenu();
    }, 10);
  }
}

// Debounce function to avoid frequent triggering
const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

// Use debounce to wrap handleOutsideClick
const debouncedHandleOutsideClick = debounce(handleOutsideClick, 100);

// Route navigation method
const navigateTo = (path) => {
  closeUserMenu()
  // Force refresh view even if it's the same path
  if (router.currentRoute.value.path === path) {
    router.replace({ path: path + '?t=' + Date.now() }).catch(() => {})
  } else {
    router.push(path)
  }
}

// Watch for route changes, close user menu
watch(() => router.currentRoute.value, () => {
  closeUserMenu()
  // Get cart and wishlist counts when route changes
  fetchCartItemCount()
  fetchWishlistItemCount()
}, { deep: true })

// Get cart item count
const fetchCartItemCount = async () => {
  if (isLoggedIn.value) {
    try {
      const response = await cartAPI.getCart()
      if (response.data && response.data.bookId && Array.isArray(response.data.bookId)) {
        cartItemCount.value = response.data.bookId.length
      } else {
        // Fallback to localStorage
        try {
          const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
          cartItemCount.value = localCart.length
        } catch (err) {
          console.error('Failed to read local cart data:', err)
          cartItemCount.value = 0
        }
      }
    } catch (err) {
      console.error('Failed to get cart data:', err)
      // Fallback to localStorage
      try {
        const localCart = JSON.parse(localStorage.getItem('cartItems') || '[]')
        cartItemCount.value = localCart.length
      } catch (err) {
        console.error('Failed to read local cart data:', err)
        cartItemCount.value = 0
      }
    }
  } else {
    cartItemCount.value = 0
  }
}

// Get wishlist item count
const fetchWishlistItemCount = async () => {
  if (isLoggedIn.value) {
    try {
      const wishlistData = await getWishlist()
      if (wishlistData && wishlistData.bookId && Array.isArray(wishlistData.bookId)) {
        wishlistItemCount.value = wishlistData.bookId.length
      } else {
        wishlistItemCount.value = 0
      }
    } catch (err) {
      console.error('Failed to get wishlist data:', err)
      wishlistItemCount.value = 0
    }
  } else {
    wishlistItemCount.value = 0
  }
}

onMounted(() => {
  // Initialize user state
  userStore.initUserState()
  // Get cart count
  fetchCartItemCount()
  // Get wishlist count
  fetchWishlistItemCount()

  // Listen for localStorage changes, update cart count
  window.addEventListener('storage', event => {
    if (event.key === 'cartItems') {
      fetchCartItemCount()
    }
  })

  // Custom event listener for cart changes
  document.addEventListener('cart-updated', () => {
    fetchCartItemCount()
  })

  // Custom event listener for wishlist changes
  document.addEventListener('wishlist-updated', () => {
    fetchWishlistItemCount()
  })

  // Add global click event listener, using debounced version
  document.addEventListener('click', debouncedHandleOutsideClick)

  // Add extra mousedown event listener in case click events fail
  document.addEventListener('mousedown', debouncedHandleOutsideClick)
})

onUnmounted(() => {
  // Remove global click event listeners
  document.removeEventListener('click', debouncedHandleOutsideClick)
  document.removeEventListener('mousedown', debouncedHandleOutsideClick)
})

const toggleUserMenu = () => {
  // Toggle display state
  showUserMenu.value = !showUserMenu.value;

  // If menu is opened, ensure click events are properly handled
  if (showUserMenu.value) {
    // Use setTimeout to ensure DOM is updated before adding one-time click listener
    setTimeout(() => {
      // Add one-time click listener as backup if handleOutsideClick fails
      document.addEventListener('click', (e) => {
        // Ensure click is not inside the menu
        if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
          closeUserMenu();
        }
      }, { once: true });
    }, 0);
  }
}

const logout = async () => {
  try {
    await userStore.logout()
    showUserMenu.value = false
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { title: searchQuery.value.trim() }
    })
    searchQuery.value = ''
    closeUserMenu()
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
  gap: 10px;
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

.cart-btn, .wishlist-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #333;
  transition: all 0.3s;
  text-decoration: none;
  position: relative;
}

.cart-btn.has-items, .wishlist-btn.has-items {
  color: #e9a84c;
  animation: pulse 1s;
}

.cart-btn:hover, .wishlist-btn:hover {
  background: #f5f5f5;
  color: #e9a84c;
}

.cart-btn i, .wishlist-btn i {
  font-size: 18px;
}

.cart-counter, .wishlist-counter {
  position: absolute;
  top: -2px;
  right: -2px;
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
  gap: 6px;
  cursor: pointer;
  position: relative;
  padding: 5px 8px;
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

/* Responsive styles */
@media (max-width: 768px) {
  .main-nav {
    display: none;
  }

  .header-container {
    padding: 10px 15px;
  }

  .user-actions {
    gap: 6px;
  }

  .username {
    max-width: 70px;
  }

  .search-container {
    max-width: 180px;
  }
}

/* Further optimize for smaller screens */
@media (max-width: 480px) {
  .user-actions {
    gap: 4px;
  }

  .cart-btn, .wishlist-btn {
    width: 32px;
    height: 32px;
  }

  .cart-btn i, .wishlist-btn i {
    font-size: 16px;
  }

  .user-profile {
    padding: 4px 6px;
  }

  .username {
    max-width: 50px;
  }

  .search-container {
    max-width: 150px;
  }
}
</style>
