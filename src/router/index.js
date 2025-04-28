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
  {
    path: '/user/favorites',
    name: 'Favorites',
    component: FavoritesPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/topup',
    name: 'TopUp',
    component: () => import('../views/TopUpPage.vue'),
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
