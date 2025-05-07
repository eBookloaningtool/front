import { createRouter, createWebHistory } from 'vue-router'
import RegisterPage from '../views/RegisterPage.vue'
import Home from '../views/Home.vue'
import BookDetail from '../views/BookDetail.vue'
import ShoppingCart from '../views/ShoppingCart.vue'
import UserDashboard from '../views/UserDashboard.vue'
import ProfilePage from '../views/ProfilePage.vue'
import MyBooksPage from '../views/MyBooksPage.vue'
import FavoritesPage from '../views/FavoritesPage.vue'
import Books from '../views/Books.vue'
import Categories from '../views/Categories.vue'
import SearchResults from '../views/SearchResults.vue'
import CategoryDetail from '../views/CategoryDetail.vue'
import { useUserStore } from '../stores/userStore'
import ReaderPage from '../views/ReaderPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/books',
    name: 'Books',
    component: Books
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories
  },
  {
    path: '/category/:id',
    name: 'CategoryDetail',
    component: CategoryDetail
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/login',
    name: 'Login',
    // Use lazy-loading method
    component: () => import('../views/LoginPage.vue'),
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: BookDetail
  },
  {
    path: '/search',
    name: 'SearchResults',
    component: SearchResults
  },
  {
    path: '/cart',
    name: 'ShoppingCart',
    component: ShoppingCart,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/books',
    name: 'MyBooks',
    component: MyBooksPage,
    meta: { requiresAuth: true }
  },
  // 用户资料页新增路由
  {
    path: '/user/recent-borrows',
    name: 'RecentBorrows',
    component: () => import('../views/user/RecentBorrowsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/loan-history',
    name: 'LoanHistory',
    component: () => import('../views/user/LoanHistoryPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/wishlist',
    name: 'Wishlist',
    component: () => import('../views/user/WishlistPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/reviews',
    name: 'MyReviews',
    component: () => import('../views/user/ReviewsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/payment-orders',
    name: 'PaymentOrders',
    component: () => import('../views/user/PaymentOrdersPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/user/settings',
    name: 'Settings',
    component: () => import('../views/user/SettingsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reader',
    name: 'Reader',
    component: () => import('@/views/Reader.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 初始化用户状态，从localStorage恢复登录状态
  userStore.initUserState()

  // 检查页面是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // 如果页面需要认证，但用户未登录，则重定向到首页
  if (requiresAuth && !userStore.isAuthenticated) {
    next({ path: '/' })
  } else {
    // 如果用户已登录且尝试访问登录或注册页面，重定向到主页
    if (userStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      next({ path: '/' })
    } else {
      next() // 继续导航
    }
  }
})

export default router
