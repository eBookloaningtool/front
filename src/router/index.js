import { createRouter, createWebHistory } from 'vue-router'
import RegisterPage from '../views/RegisterPage.vue'
import Home from '../views/Home.vue'
import BookDetail from '../views/BookDetail.vue'
import ShoppingCart from '../views/ShoppingCart.vue'
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
    redirect: '/user/profile',
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
  // User profile page new routes
  {
    path: '/user/recent-borrows',
    name: 'RecentBorrows',
    component: ProfilePage,
    props: { query: { view: 'RecentBorrows' }},
    meta: { requiresAuth: true }
  },
  {
    path: '/user/loan-history',
    name: 'LoanHistory',
    component: ProfilePage,
    props: { query: { view: 'LoanHistory' }},
    meta: { requiresAuth: true }
  },
  {
    path: '/user/wishlist',
    name: 'Wishlist',
    component: ProfilePage,
    props: { query: { view: 'Wishlist' }},
    meta: { requiresAuth: true }
  },
  {
    path: '/user/reviews',
    name: 'MyReviews',
    component: ProfilePage,
    props: { query: { view: 'MyReviews' }},
    meta: { requiresAuth: true }
  },
  {
    path: '/user/payment-orders',
    name: 'PaymentOrders',
    component: ProfilePage,
    props: { query: { view: 'PaymentOrders' }},
    meta: { requiresAuth: true }
  },
  {
    path: '/user/settings',
    name: 'Settings',
    component: ProfilePage,
    props: { query: { view: 'Settings' }},
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

// Global before guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // Initialize user state, restore login status from localStorage
  userStore.initUserState()

  // Check if page requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // If page requires authentication, but user is not logged in, redirect to home page
  if (requiresAuth && !userStore.isAuthenticated) {
    next({ path: '/' })
  } else {
    // If user is logged in and tries to access login or register page, redirect to home page
    if (userStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
      next({ path: '/' })
    } else {
      next() // Continue navigation
    }
  }
})

export default router
