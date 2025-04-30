<template>
  <div class="profile-page bg-cream">
    <Header />

    <!-- 主内容区域，添加足够的上边距避免被导航栏遮挡 -->
    <div class="main-container">
      <!-- 左侧菜单 -->
      <div class="sidebar">
        <div class="menu-item" :class="{ active: currentView === 'Profile' }">
          <a href="#" @click.prevent="switchView('Profile')">
            <span class="icon"><i class="ri-user-line"></i></span>
            <span class="text">User Details</span>
          </a>
        </div>
        <div class="menu-item" :class="{ active: currentView === 'RecentBorrows' }">
          <a href="#" @click.prevent="switchView('RecentBorrows')">
            <span class="icon"><i class="ri-book-read-line"></i></span>
            <span class="text">Current Borrowings</span>
          </a>
        </div>
        <div class="menu-item" :class="{ active: currentView === 'LoanHistory' }">
          <a href="#" @click.prevent="switchView('LoanHistory')">
            <span class="icon"><i class="ri-history-line"></i></span>
            <span class="text">Loan History</span>
          </a>
        </div>
        <div class="menu-item" :class="{ active: currentView === 'Wishlist' }">
          <a href="#" @click.prevent="switchView('Wishlist')">
            <span class="icon"><i class="ri-heart-line"></i></span>
            <span class="text">Wish List</span>
          </a>
        </div>
        <div class="menu-item" :class="{ active: currentView === 'MyReviews' }">
          <a href="#" @click.prevent="switchView('MyReviews')">
            <span class="icon"><i class="ri-chat-1-line"></i></span>
            <span class="text">Comment Records</span>
          </a>
        </div>
        <div class="menu-item" :class="{ active: currentView === 'TopUp' }">
          <a href="#" @click.prevent="switchView('TopUp')">
            <span class="icon"><i class="ri-wallet-3-line"></i></span>
            <span class="text">Top Up</span>
          </a>
        </div>
        <div class="menu-item" :class="{ active: currentView === 'PaymentOrders' }">
          <a href="#" @click.prevent="switchView('PaymentOrders')">
            <span class="icon"><i class="ri-time-line"></i></span>
            <span class="text">Payment Records</span>
          </a>
        </div>
        <div class="menu-item" :class="{ active: currentView === 'Settings' }">
          <a href="#" @click.prevent="switchView('Settings')">
            <span class="icon"><i class="ri-settings-line"></i></span>
            <span class="text">Settings</span>
          </a>
        </div>
        <div class="menu-item">
          <a href="#" @click.prevent="logout">
            <span class="icon"><i class="ri-logout-box-line"></i></span>
            <span class="text">Log out</span>
          </a>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="content">
        <!-- 用户详情视图 -->
        <div v-if="currentView === 'Profile'" class="user-details">
          <h2 class="page-title">User Details</h2>

          <div class="detail-item">
            <div class="detail-label">
              <span class="label-text">User:</span>
            </div>
            <div class="detail-value">{{ username }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <span class="label-text">Email:</span>
            </div>
            <div class="detail-value">{{ email }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <span class="label-text">Registration Date:</span>
            </div>
            <div class="detail-value">{{ registrationDate }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              <span class="label-text">Account Balance:</span>
            </div>
            <div class="detail-value">£{{ accountBalance.toFixed(2) }}</div>
          </div>
        </div>

        <!-- 当前借阅视图 -->
        <div v-if="currentView === 'RecentBorrows'" class="recent-borrows">
          <h2 class="page-title">Current Borrowings</h2>

          <div v-if="loadingBooks" class="loading-state">
            <p>加载中...</p>
          </div>

          <div v-else-if="recentBooks.length === 0" class="empty-state">
            <p>您目前没有正在阅读的图书</p>
            <router-link
              to="/books"
              class="browse-btn"
            >
              浏览图书馆
            </router-link>
          </div>

          <div v-else class="books-list">
            <div v-for="book in recentBooks" :key="book.id" class="book-item">
              <div class="book-cover">
                <img v-if="book.cover" :src="book.cover" alt="书籍封面" />
              </div>
              <div class="book-info">
                <div class="book-header">
                  <h3 class="book-title">{{ book.title }}</h3>
                  <div class="book-dates">
                    <div class="borrow-date">借阅日期: {{ formatDate(book.borrowDate) }}</div>
                    <div class="due-date">应归还日期: {{ formatDate(book.dueDate) }}</div>
                  </div>
                </div>
                <p class="book-author">{{ book.author }}</p>
                <div class="book-actions">
                  <button
                    @click="viewBookDetails(book.id)"
                    class="read-btn"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 借阅历史视图 -->
        <div v-if="currentView === 'LoanHistory'" class="loan-history">
          <h2 class="page-title">Loan History</h2>
          <p class="subtitle">View all your borrowing records</p>

          <div v-if="loadingLoans" class="loading-state">
            <p>Loading...</p>
          </div>

          <div v-else>
            <!-- 搜索和筛选 -->
            <div class="filter-container">
              <div class="search-input">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="Search by title or author..."
                  class="search-field"
                />
              </div>
              <div class="status-select">
                <select v-model="statusFilter" class="select-field">
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="returned">Returned</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div v-if="filteredLoans.length === 0" class="empty-state">
              <p>No borrowing records found</p>
            </div>

            <div v-else class="loans-table-container">
              <table class="loans-table">
                <thead>
                  <tr>
                    <th>Book Info</th>
                    <th>Borrow Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="loan in paginatedLoans" :key="loan.id">
                    <td>
                      <div class="book-info-cell">
                        <div class="loan-book-cover">
                          <img v-if="loan.cover" :src="loan.cover" :alt="loan.title" />
                        </div>
                        <div class="loan-book-meta">
                          <div class="loan-book-title" @click="viewBookDetails(loan.bookId)">
                            {{ loan.title }}
                          </div>
                          <div class="loan-book-author">{{ loan.author }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ formatDate(loan.borrowDate) }}</td>
                    <td>{{ formatDate(loan.dueDate) }}</td>
                    <td>
                      <span
                        class="status-badge"
                        :class="{
                          'status-returned': loan.status === 'returned',
                          'status-borrowed': loan.status === 'borrowed',
                          'status-overdue': loan.status === 'overdue'
                        }"
                      >
                        {{ getStatusText(loan.status) }}
                      </span>
                    </td>
                    <td class="text-right">
                      <button
                        v-if="loan.status === 'active'"
                        @click="extendLoan(loan.id)"
                        class="extend-btn"
                      >
                        Extend
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 分页控件 -->
            <div class="pagination">
              <div class="pagination-mobile">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="page-btn"
                >
                  Previous
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  class="page-btn"
                >
                  Next
                </button>
              </div>
              <div class="pagination-desktop">
                <div class="pagination-info">
                  Showing <span>{{ paginationStart }}</span> to <span>{{ paginationEnd }}</span> of <span>{{ filteredLoans.length }}</span> records
                </div>
                <div class="pagination-controls">
                  <button
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    class="page-arrow"
                  >
                    &lt;
                  </button>

                  <button
                    v-for="page in displayedPages"
                    :key="page"
                    @click="goToPage(page)"
                    :class="[
                      'page-number',
                      currentPage === page ? 'page-current' : ''
                    ]"
                  >
                    {{ page }}
                  </button>

                  <button
                    @click="nextPage"
                    :disabled="currentPage >= totalPages"
                    class="page-arrow"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 愿望清单视图 -->
        <div v-if="currentView === 'Wishlist'" class="wishlist">
          <h2 class="page-title">My Wish List</h2>
          <p class="subtitle">Manage your saved books</p>

          <div v-if="loadingWishlist" class="loading-state">
            <p>Loading...</p>
          </div>

          <div v-else-if="wishlistItems.length === 0" class="empty-state">
            <p>Your wish list is empty</p>
            <router-link
              to="/books"
              class="browse-btn"
            >
              Browse Library
            </router-link>
          </div>

          <div v-else class="wishlist-grid">
            <div v-for="book in wishlistItems" :key="book.id" class="wishlist-item">
              <div class="wishlist-book-cover">
                <img v-if="book.cover" :src="book.cover" :alt="book.title" />
              </div>
              <div class="wishlist-book-info">
                <h3 class="wishlist-book-title">{{ book.title }}</h3>
                <p class="wishlist-book-author">{{ book.author }}</p>
                <p class="wishlist-book-price">￡{{ book.price }}</p>
                <div class="wishlist-actions">
                  <button
                    @click="viewBookDetails(book.id)"
                    class="view-btn"
                  >
                    View Details
                  </button>
                  <button
                    @click="handleRemoveFromWishlist(book.id)"
                    class="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论记录视图 -->
        <div v-if="currentView === 'MyReviews'" class="reviews">
          <h2 class="page-title">My Reviews</h2>

          <div v-if="loadingReviews" class="loading-state">
            <p>Loading...</p>
          </div>

          <div v-else-if="reviews.length === 0" class="empty-state">
            <p>You haven't posted any reviews yet</p>
            <router-link
              to="/books"
              class="browse-btn"
            >
              Browse Books
            </router-link>
          </div>

          <div v-else class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <h3 class="review-book-title" @click="viewBookDetails(review.bookId)">
                  {{ review.bookTitle }}
                </h3>
                <div class="review-actions">
                  <button
                    @click="deleteReview(review.id)"
                    class="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div class="review-meta">
                <div class="rating-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= review.rating }">★</span>
                </div>
                <span class="review-date">{{ formatDate(review.createdAt) }}</span>
              </div>

              <p class="review-content">{{ review.content }}</p>
            </div>
          </div>
        </div>

        <!-- 支付记录视图 -->
        <div v-if="currentView === 'PaymentOrders'" class="payment-orders">
          <h2 class="page-title">支付记录</h2>
          <p class="subtitle">查看您的充值记录</p>

          <div v-if="loadingOrders" class="loading-state">
            <p>加载中...</p>
          </div>

          <div v-else>
            <div v-if="completedOrders.length === 0" class="empty-state">
              <p>暂无充值记录</p>
              <router-link
                to="/top-up"
                class="browse-btn"
              >
                立即充值
              </router-link>
            </div>

            <div v-else class="orders-list">
              <div
                v-for="order in completedOrders"
                :key="order.id"
                class="order-item"
              >
                <div class="order-header">
                  <div class="order-info">
                    <span class="order-number">订单号: {{ order.orderNumber }}</span>
                    <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                  </div>
                  <span class="order-status status-completed">
                    已完成
                  </span>
                </div>

                <div class="order-content">
                  <div class="order-payment-info">
                    <div class="payment-label">充值金额</div>
                    <div class="payment-value">£{{ order.amount.toFixed(2) }}</div>
                  </div>

                  <div class="order-payment-info">
                    <div class="payment-label">支付时间</div>
                    <div class="payment-value">{{ formatDate(order.paidAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 充值视图 -->
        <div v-if="currentView === 'TopUp'" class="topup-view">
          <h2 class="page-title">Account Top Up</h2>
          <p class="subtitle">Add funds to your account</p>

          <!-- 当前余额显示 -->
          <div class="balance-display">
            <i class="ri-wallet-3-line"></i>
            <span>Current Balance: £{{ accountBalance }}</span>
          </div>

          <!-- 充值金额选项 -->
          <div class="amount-options">
            <h3>Select Amount</h3>
            <div class="amount-grid">
              <button
                v-for="amount in presetTopUpAmounts"
                :key="amount"
                :class="['amount-btn', { 'selected': selectedTopUpAmount === amount }]"
                @click="selectTopUpAmount(amount)"
              >
                £{{ amount }}
              </button>
            </div>
          </div>

          <!-- 自定义金额输入 -->
          <div class="custom-amount">
            <h3>Custom Amount</h3>
            <div class="input-group">
              <span class="currency-symbol">£</span>
              <input
                type="number"
                v-model="customTopUpAmount"
                placeholder="Enter amount"
                @input="handleCustomTopUpAmount"
                min="1"
                step="1"
              />
            </div>
          </div>

          <!-- 确认充值按钮 -->
          <button
            class="confirm-btn"
            :disabled="!isTopUpAmountValid || processingTopUp"
            @click="handleTopUp"
          >
            <i v-if="processingTopUp" class="ri-loader-4-line loading-icon"></i>
            <span v-else>Confirm Top Up</span>
          </button>

          <!-- 充值说明 -->
          <div class="topup-info">
            <i class="ri-information-line"></i>
            <p>The amount will be credited instantly to your account and can be used for book rentals.</p>
          </div>
        </div>

        <!-- Settings View -->
        <div v-if="currentView === 'Settings'" class="settings-view">
          <h2 class="page-title">Account Settings</h2>
          <p class="subtitle">Manage your personal information</p>

          <form @submit.prevent="updateUserInfo" class="settings-form">
            <!-- Username -->
            <div class="form-group">
              <label for="username">Username</label>
              <input
                type="text"
                id="username"
                v-model="updateForm.name"
                placeholder="Enter new username"
                class="form-control"
              />
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                v-model="updateForm.email"
                placeholder="Enter new email"
                class="form-control"
              />
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                v-model="updateForm.password"
                placeholder="Enter new password"
                class="form-control"
              />
              <p class="password-hint">Leave blank if you don't want to change your password</p>
            </div>

            <!-- Status and Error Messages -->
            <div v-if="updateError" class="error-message">
              {{ updateError }}
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="update-btn"
              :disabled="isUpdating"
            >
              <i v-if="isUpdating" class="ri-loader-4-line loading-icon"></i>
              <span v-else>Save Changes</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Header from '../components/Header.vue';
import { useUserStore } from '../stores/userStore';
import { useToast } from '../composables/useToast';
import { getPaymentHistory, topUpBalance } from '../api/payments';
import { getWishlist, getBookDetail, removeFromWishlist } from '../api/booksApi';
import { getBorrowHistory, getBorrowList } from '../api/borrowApi';
import { get, post } from '../utils/request';

// 默认封面图片
const defaultCover = '/images/books/default-cover.jpg';

const router = useRouter();
const route = useRoute();
const { showToast } = useToast();

const username = ref('');
const email = ref('');
const registrationDate = ref('');
const userId = ref('');
const accountBalance = ref(0);

// 当前借阅相关状态
const recentBooks = ref([]);
const loadingBooks = ref(false);

// 借阅历史相关状态
const loans = ref([]);
const loadingLoans = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = 5;

// 愿望清单相关状态
const wishlistItems = ref([]);
const loadingWishlist = ref(false);

// 评论记录相关状态
const reviews = ref([]);
const loadingReviews = ref(false);

// 支付订单相关状态
const orders = ref([]);
const loadingOrders = ref(false);
const currentOrderTab = ref('unpaid');
const showPaymentModal = ref(false);
const currentOrder = ref({});
const paymentMethod = ref('alipay');

// 充值相关状态
const presetTopUpAmounts = [50, 100, 200, 500, 1000];
const selectedTopUpAmount = ref(null);
const customTopUpAmount = ref('');
const processingTopUp = ref(false);

// 用户信息更新相关状态
const updateForm = ref({
  name: '',
  email: '',
  password: ''
});
const isUpdating = ref(false);
const updateError = ref('');

// 支付记录标签页选项
const orderTabs = [
  { id: 'unpaid', name: 'Unpaid' },
  { id: 'completed', name: 'Completed' },
  { id: 'cancelled', name: 'Cancelled' }
];

// 当前视图，默认为Profile
const currentView = ref('Profile');

// 计算最终充值金额
const finalTopUpAmount = computed(() => {
  return selectedTopUpAmount.value || Number(customTopUpAmount.value) || 0;
});

// 验证金额是否有效
const isTopUpAmountValid = computed(() => {
  return finalTopUpAmount.value > 0 && finalTopUpAmount.value <= 10000;
});

// 选择预设金额
const selectTopUpAmount = (amount) => {
  selectedTopUpAmount.value = amount;
  customTopUpAmount.value = '';
};

// 处理自定义金额输入
const handleCustomTopUpAmount = () => {
  selectedTopUpAmount.value = null;
  // 限制最大金额为10000
  if (Number(customTopUpAmount.value) > 10000) {
    customTopUpAmount.value = '10000';
  }
};

// 处理充值
const handleTopUp = async () => {
  if (!isTopUpAmountValid.value || processingTopUp.value) return;

  processingTopUp.value = true;

  try {
    const result = await topUpBalance(finalTopUpAmount.value);
    
    if (result.state === 'success') {
      // 更新账户余额
      accountBalance.value = result.balance;
      // 更新 UserStore 中的余额
      const userStore = useUserStore();
      userStore.balance = result.balance;
      
      showToast(`充值成功！已添加 £${finalTopUpAmount.value} 到您的账户`, 'success');

      // 重置表单
      selectedTopUpAmount.value = null;
      customTopUpAmount.value = '';

      // 显示支付记录
      switchView('PaymentOrders');
    } else {
      throw new Error('充值失败');
    }
  } catch (error) {
    console.error('充值失败:', error);
    showToast('充值失败，请稍后重试', 'error');
  } finally {
    processingTopUp.value = false;
  }
};

// 切换视图的方法
const switchView = (view) => {
  currentView.value = view;

  // 根据视图加载相应数据
  if (view === 'RecentBorrows') {
    fetchRecentBooks();
  } else if (view === 'LoanHistory') {
    fetchLoanHistory();
  } else if (view === 'Wishlist') {
    fetchWishlist();
  } else if (view === 'MyReviews') {
    fetchReviews();
  } else if (view === 'PaymentOrders') {
    fetchOrders();
  } else if (view === 'TopUp') {
    // 加载充值页面时获取当前余额
    fetchUserInfo();
  } else if (view === 'Settings') {
    // Reset form fields
    updateForm.value = {
      name: '',
      email: '',
      password: ''
    };
    // Clear any previous error messages
    updateError.value = '';
  }
};

// 头像生成逻辑
const avatarUrl = computed(() => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username.value)}&background=random`;
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Unknown';

  // 使用英文格式
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'borrowed': return 'Borrowed';
    case 'returned': return 'Returned';
    case 'overdue': return 'Overdue';
    default: return status;
  }
};

// 登出方法
const logout = async () => {
  try {
    const userStore = useUserStore();
    await userStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('登出失败:', error);
    showToast('登出失败，请重试', 'error');
  }
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await post({
      url: '/api/users/info'
    });
    
    if (response) {
      // 更新用户信息
      username.value = response.name;
      email.value = response.email;
      registrationDate.value = formatDate(response.createdat);
      accountBalance.value = response.balance;
      
      // 更新 UserStore 中的信息
      const userStore = useUserStore();
      userStore.userName = response.name;
      userStore.userEmail = response.email;
      userStore.createdAt = response.createdat;
      userStore.balance = response.balance;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    showToast('获取用户信息失败，请稍后重试', 'error');
  }
};

// 获取最近借阅的图书
const fetchRecentBooks = async () => {
  loadingBooks.value = true;
  try {
    // 获取当前借阅列表
    const borrowListResponse = await getBorrowList();
    
    if (borrowListResponse.state === 'success') {
      // 获取每本书的详细信息
      const bookDetailsPromises = borrowListResponse.data.map(async (borrow) => {
        try {
          const bookDetail = await get({
            url: `/api/books/get?bookId=${borrow.bookId}`
          });
          
          return {
            id: borrow.bookId,
            title: bookDetail.title,
            author: bookDetail.author,
            cover: bookDetail.coverUrl || '/images/books/default-cover.jpg',
            borrowDate: borrow.borrowDate,
            dueDate: borrow.dueDate
          };
        } catch (error) {
          console.error(`获取书籍 ${borrow.bookId} 详情失败:`, error);
          return {
            id: borrow.bookId,
            title: '未知书籍',
            author: '未知作者',
            cover: '/images/books/default-cover.jpg',
            borrowDate: borrow.borrowDate,
            dueDate: borrow.dueDate
          };
        }
      });

      recentBooks.value = await Promise.all(bookDetailsPromises);
    } else {
      throw new Error('获取借阅列表失败');
    }
  } catch (error) {
    console.error('获取最近阅读图书失败:', error);
    showToast('获取最近阅读图书失败，请稍后重试', 'error');
  } finally {
    loadingBooks.value = false;
  }
};

// 获取借阅历史
const fetchLoanHistory = async () => {
  try {
    loadingLoans.value = true;
    const response = await getBorrowHistory();
    loans.value = response.data.map(loan => ({
      ...loan,
      cover: loan.cover || loan.bookCover || '/images/books/default-cover.jpg'
    }));
  } catch (error) {
    console.error('获取借阅历史失败:', error);
    showToast('获取借阅历史失败，请稍后重试', 'error');
  } finally {
    loadingLoans.value = false;
  }
};

// 获取愿望清单
const fetchWishlist = async () => {
  loadingWishlist.value = true;
  try {
    // 获取愿望清单中的书籍ID列表
    const wishlistData = await getWishlist();
    
    // 获取每本书的详情
    const bookPromises = wishlistData.bookId.map(bookId => getBookDetail(bookId));
    const bookDetails = await Promise.all(bookPromises);
    
    // 转换数据格式
    wishlistItems.value = bookDetails.map(book => ({
      id: book.bookId,
      title: book.title,
      author: book.author,
      cover: book.coverUrl,
      price: book.price.toFixed(2)
    }));
  } catch (error) {
    console.error('获取愿望清单失败:', error);
    showToast('获取愿望清单失败，请稍后重试', 'error');
  } finally {
    loadingWishlist.value = false;
  }
};

// 从愿望清单中移除书籍
const handleRemoveFromWishlist = async (bookId) => {
  try {
    const result = await removeFromWishlist(bookId);
    if (result.state === 'success') {
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== bookId);
      showToast('已从愿望清单中移除', 'success');
    } else {
      throw new Error('移除失败');
    }
  } catch (error) {
    console.error('移除书籍失败:', error);
    showToast('移除书籍失败，请稍后重试', 'error');
  }
};

// 获取评论记录
const fetchReviews = async () => {
  loadingReviews.value = true;
  try {
    // 获取用户的评论ID列表
    const userCommentsResponse = await post({
      url: '/api/reviews/user'
    });
    
    if (userCommentsResponse && userCommentsResponse.state === 'success' && userCommentsResponse.commentIds) {
      // 获取每个评论的详细内容
      const reviewPromises = userCommentsResponse.commentIds.map(async (commentId) => {
        try {
          const response = await get({
            url: `/api/reviews/content?commentId=${commentId}`
          });
          
          if (response.state === 'success') {
            // 获取书籍详情
            const bookResponse = await get({
              url: `/api/books/get?bookId=${response.bookId}`
            });
            
            return {
              id: commentId,
              bookId: response.bookId,
              bookTitle: bookResponse.title || 'Unknown Book',
              rating: response.rating,
              content: response.comment,
              createdAt: response.createdAt || new Date().toISOString(),
              username: response.username
            };
          }
          return null;
        } catch (error) {
          console.error(`获取评论 ${commentId} 详情失败:`, error);
          return null;
        }
      });

      // 等待所有评论详情获取完成
      const reviewResults = await Promise.all(reviewPromises);
      // 过滤掉获取失败的评论
      reviews.value = reviewResults.filter(review => review !== null);
    } else {
      reviews.value = [];
    }
  } catch (error) {
    console.error('获取评论失败:', error);
    showToast('获取评论失败，请稍后重试', 'error');
    reviews.value = [];
  } finally {
    loadingReviews.value = false;
  }
};

// 获取支付订单
const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    const result = await getPaymentHistory();
    if (result.state === 'success') {
      // 将 API 返回的数据转换为页面需要的格式
      orders.value = result.data.map(payment => ({
        id: payment.paymentId,
        orderNumber: payment.paymentId,
        amount: payment.amount,
        status: 'completed',
        createdAt: payment.date,
        paidAt: payment.date,
        type: 'top-up'
      }));
    } else {
      throw new Error('获取支付历史失败');
    }
  } catch (error) {
    console.error('获取支付历史失败:', error);
    showToast('获取支付历史失败，请稍后重试', 'error');
    orders.value = [];
  } finally {
    loadingOrders.value = false;
  }
};

// 根据状态筛选订单
const completedOrders = computed(() => {
  return orders.value;
});

const unpaidOrders = computed(() => {
  return [];
});

const cancelledOrders = computed(() => {
  return [];
});

// 获取订单状态文本
const getOrderStatusText = (status) => {
  return '已完成';
};

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`);
};

// 取消订单
const cancelOrder = (orderId) => {
  if (confirm('Are you sure you want to cancel this order?')) {
    // 这里应该调用API取消订单
    const orderIndex = orders.value.findIndex(order => order.id === orderId);
    if (orderIndex !== -1) {
      const order = orders.value[orderIndex];
      order.status = 'cancelled';
      order.cancelledAt = new Date().toISOString();
      orders.value = [...orders.value]; // 触发响应式更新
    }
  }
};

// 支付订单
const payOrder = (order) => {
  currentOrder.value = order;
  showPaymentModal.value = true;
  paymentMethod.value = 'alipay'; // 默认支付方式
};

// 关闭支付对话框
const closePaymentModal = () => {
  showPaymentModal.value = false;
};

// 确认支付
const confirmPayment = () => {
  // 这里应该调用API进行支付处理
  const orderIndex = orders.value.findIndex(order => order.id === currentOrder.value.id);
  if (orderIndex !== -1) {
    const order = orders.value[orderIndex];
    order.status = 'completed';
    order.paidAt = new Date().toISOString();
    orders.value = [...orders.value]; // 触发响应式更新
  }
  showPaymentModal.value = false;
  alert(`Payment successful using ${paymentMethod.value === 'alipay' ? 'Alipay' : paymentMethod.value === 'wechat' ? 'WeChat Pay' : 'Credit Card'}!`);
};

// 根据当前路由设置初始视图
onMounted(() => {
  // 获取用户信息
  fetchUserInfo();

  // 根据路由路径设置初始视图
  const path = route.path;
  if (path === '/user/profile') {
    currentView.value = 'Profile';
  } else if (path === '/user/recent-borrows') {
    currentView.value = 'RecentBorrows';
    fetchRecentBooks();
  } else if (path === '/user/loan-history') {
    currentView.value = 'LoanHistory';
    fetchLoanHistory();
  } else if (path === '/user/wishlist') {
    currentView.value = 'Wishlist';
    fetchWishlist();
  } else if (path === '/user/reviews') {
    currentView.value = 'MyReviews';
    fetchReviews();
  } else if (path === '/user/payment-orders') {
    currentView.value = 'PaymentOrders';
    fetchOrders();
  }
});

// 借阅历史相关的计算属性和方法
// 根据搜索和过滤条件筛选借阅记录
const filteredLoans = computed(() => {
  return loans.value.filter(loan => {
    // 状态过滤
    if (statusFilter.value !== 'all' && loan.status !== statusFilter.value) {
      return false;
    }

    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      return loan.title.toLowerCase().includes(query) ||
              loan.author.toLowerCase().includes(query);
    }

    return true;
  });
});

// 分页相关计算属性
const totalPages = computed(() => Math.ceil(filteredLoans.value.length / pageSize));

const paginatedLoans = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return filteredLoans.value.slice(start, end);
});

const paginationStart = computed(() => {
  if (filteredLoans.value.length === 0) return 0;
  return (currentPage.value - 1) * pageSize + 1;
});

const paginationEnd = computed(() => {
  if (filteredLoans.value.length === 0) return 0;
  return Math.min(currentPage.value * pageSize, filteredLoans.value.length);
});

// 显示的页码范围
const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 2) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
});

// 分页导航
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = (page) => {
  if (typeof page === 'number') {
    currentPage.value = page;
  }
};

// 查看借阅详情
const viewLoanDetail = (loanId) => {
  router.push(`/book/${loanId}`);
};

// 延长借阅
const extendLoan = (loanId) => {
  // 这里应该调用API延长借阅
  alert(`Loan extension requested for ID: ${loanId}`);
};

// 继续阅读函数 - 页面跳转
const continueReading = (bookId) => {
  router.push(`/reader/${bookId}`);
};

// 查看图书详情
const viewBookDetails = (bookId) => {
  router.push(`/book/${bookId}`);
};

// 删除评论
const deleteReview = async (reviewId) => {
  if (confirm('Are you sure you want to delete this comment?')) {
    try {
      const response = await post({
        url: '/api/reviews/delete',
        data: { commentId: reviewId }
      });
      
      if (response.state === 'success') {
        // 从列表中移除已删除的评论
        reviews.value = reviews.value.filter(review => review.id !== reviewId);
        showToast('评论已删除', 'success');
      } else {
        throw new Error('删除评论失败');
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      showToast('删除评论失败，请稍后重试', 'error');
    }
  }
};

// 更新用户信息方法
const updateUserInfo = async () => {
  if (isUpdating.value) return;

  // Validate form
  if (!updateForm.value.name && !updateForm.value.email && !updateForm.value.password) {
    updateError.value = 'Please fill at least one field to update';
    return;
  }

  isUpdating.value = true;
  updateError.value = '';

  try {
    // Prepare request data
    const userData = {};
    if (updateForm.value.name) userData.name = updateForm.value.name;
    if (updateForm.value.email) userData.email = updateForm.value.email;
    if (updateForm.value.password) userData.password = updateForm.value.password;

    // Call userStore update method
    const userStore = useUserStore();
    const result = await userStore.updateUserInfo(userData);

    if (result.state === 'success') {
      // Update successful
      showToast('Account information updated successfully', 'success');

      // Update displayed user info
      username.value = result.name || username.value;
      email.value = result.email || email.value;

      // Clear form
      updateForm.value = {
        name: '',
        email: '',
        password: ''
      };
    } else {
      updateError.value = 'Failed to update user information';
    }
  } catch (error) {
    console.error('Update user info error:', error);
    updateError.value = error.response?.data?.message || 'An error occurred while updating your information';
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #fffbf0;
}

.main-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px; /* 为顶部导航栏留出空间 */
  min-height: calc(100vh - 80px);
}

.sidebar {
  width: 250px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 20px 0;
  margin-right: 25px;
  height: fit-content;
}

.menu-item {
  position: relative;
}

.menu-item a {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
}

.menu-item:hover a {
  background-color: rgba(233, 168, 76, 0.05);
  color: #e9a84c;
}

.menu-item.active {
  background-color: rgba(233, 168, 76, 0.1);
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: #e9a84c;
}

.menu-item.active a {
  color: #e9a84c;
}

.icon {
  margin-right: 12px;
  font-size: 20px;
  width: 24px;
  text-align: center;
}

.content {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.user-details {
  max-width: 600px;
}

.detail-item {
  display: flex;
  margin-bottom: 20px;
  align-items: center;
}

.detail-label {
  width: 150px;
  font-weight: 500;
  color: #555;
}

.detail-value {
  flex: 1;
  color: #333;
}

/* 当前借阅样式 */
.loading-state, .empty-state {
  padding: 30px 0;
  text-align: center;
  color: #666;
}

.browse-btn {
  display: inline-block;
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #e9a84c;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.browse-btn:hover {
  background-color: #d89b44;
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.book-item {
  display: flex;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #eee;
  transition: box-shadow 0.3s;
}

.book-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.book-cover {
  width: 100px;
  height: 150px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  flex: 1;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.book-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.book-dates {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.borrow-date, .due-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.book-author {
  color: #666;
  margin: 0 0 15px 0;
}

.read-btn {
  padding: 8px 16px;
  background-color: #e9a84c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.read-btn:hover {
  background-color: #d89b44;
}

/* 借阅历史样式 */
.subtitle {
  color: #666;
  margin-top: -20px;
  margin-bottom: 30px;
}

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex: 1;
  min-width: 200px;
}

.search-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.status-select {
  width: 120px;
}

.select-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.loans-table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.loans-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

.loans-table th {
  background-color: #f8f8f8;
  padding: 12px 15px;
  text-align: left;
  font-weight: 500;
  font-size: 14px;
  color: #555;
  border-bottom: 1px solid #eee;
}

.loans-table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #333;
}

.text-right {
  text-align: right;
}

.book-info-cell {
  display: flex;
  align-items: center;
}

.loan-book-cover {
  width: 50px;
  height: 75px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.loan-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loan-book-meta {
  margin-left: 15px;
}

.loan-book-title {
  font-weight: 500;
  color: #4a6baf;
  cursor: pointer;
}

.loan-book-title:hover {
  text-decoration: underline;
}

.loan-book-author {
  font-size: 13px;
  color: #666;
  margin-top: 5px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-returned {
  background-color: #ecfdf5;
  color: #059669;
}

.status-borrowed {
  background-color: #fff7ed;
  color: #d97706;
}

.status-overdue {
  background-color: #fef2f2;
  color: #dc2626;
}

.extend-btn, .detail-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  margin-left: 5px;
}

.extend-btn {
  background-color: #3182ce;
  color: white;
}

.detail-btn {
  background-color: #f0f0f0;
  color: #333;
}

.extend-btn:hover {
  background-color: #2b6cb0;
}

.detail-btn:hover {
  background-color: #e5e5e5;
}

.pagination {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.pagination-desktop {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-mobile {
  display: none;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-info span {
  font-weight: 500;
  color: #333;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.page-arrow, .page-number {
  padding: 8px 12px;
  margin: 0 2px;
  border: 1px solid #ddd;
  background-color: #fff;
  color: #333;
  cursor: pointer;
}

.page-current {
  background-color: #e9a84c;
  border-color: #e9a84c;
  color: white;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    padding: 70px 15px 20px;
  }

  .sidebar {
    width: 100%;
    margin-right: 0;
    margin-bottom: 20px;
  }

  .content {
    width: 100%;
  }

  .book-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .book-progress {
    margin-top: 5px;
  }

  .pagination-desktop {
    display: none;
  }

  .pagination-mobile {
    display: flex;
    justify-content: space-between;
  }

  .page-btn {
    padding: 8px 16px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .filter-container {
    flex-direction: column;
  }

  .status-select {
    width: 100%;
  }
}

/* 愿望清单样式 */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.wishlist-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s, transform 0.3s;
}

.wishlist-item:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.wishlist-book-cover {
  height: 220px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.wishlist-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wishlist-book-info {
  padding: 15px;
}

.wishlist-book-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 5px 0;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wishlist-book-author {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
}

.wishlist-book-price {
  font-size: 16px;
  font-weight: 500;
  color: #e9a84c;
  margin: 0 0 15px 0;
}

.wishlist-actions {
  display: flex;
  gap: 10px;
}

.view-btn, .remove-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.3s;
}

.view-btn {
  background-color: #e9a84c;
  color: white;
}

.remove-btn {
  background-color: #f0f0f0;
  color: #333;
}

.view-btn:hover {
  background-color: #d89b44;
}

.remove-btn:hover {
  background-color: #e0e0e0;
}

/* 评论记录样式 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  transition: box-shadow 0.3s;
}

.review-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.review-book-title {
  font-size: 18px;
  font-weight: 500;
  color: #4a6baf;
  margin: 0;
  cursor: pointer;
}

.review-book-title:hover {
  text-decoration: underline;
}

.review-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #fee2e2;
  color: #b91c1c;
  outline: none;
}

.delete-btn:hover {
  background-color: #fecaca;
}

.review-meta {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.rating-stars {
  margin-right: 10px;
}

.star {
  color: #d1d5db;
  font-size: 16px;
}

.star.filled {
  color: #f59e0b;
}

.review-date {
  font-size: 14px;
  color: #6b7280;
}

.review-content {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

/* 支付订单样式 */
.tab-container {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-button:hover {
  color: #e9a84c;
}

.tab-active {
  color: #e9a84c;
  border-bottom-color: #e9a84c;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.order-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.order-item.cancelled {
  opacity: 0.75;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-number {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.order-date {
  font-size: 13px;
  color: #666;
}

.order-status {
  padding: 4px 8px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #fff8e1;
  color: #f59e0b;
}

.status-overdue {
  background-color: #fef2f2;
  color: #ef4444;
}

.status-completed {
  background-color: #ecfdf5;
  color: #059669;
}

.status-cancelled {
  background-color: #f3f4f6;
  color: #6b7280;
}

.order-content {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-book {
  display: flex;
  align-items: center;
  flex: 1;
}

.order-book-cover {
  width: 60px;
  height: 90px;
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.order-book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.order-book-info {
  margin-left: 15px;
}

.order-book-title {
  font-weight: 500;
  color: #4a6baf;
  cursor: pointer;
  margin-bottom: 5px;
}

.order-book-title:hover {
  text-decoration: underline;
}

.order-book-author {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.order-type {
  font-size: 14px;
  font-weight: 500;
}

.order-payment-info {
  text-align: right;
  margin-left: 15px;
}

.payment-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.payment-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.order-actions {
  display: flex;
  gap: 10px;
  margin-left: 15px;
}

.order-footer {
  padding: 12px 15px;
  border-top: 1px solid #eee;
  text-align: right;
}

.cancel-btn,
.pay-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn {
  background-color: #f0f0f0;
  color: #333;
}

.pay-btn {
  background-color: #e9a84c;
  color: white;
}

.cancel-btn:hover {
  background-color: #e0e0e0;
}

.pay-btn:hover {
  background-color: #d89b44;
}

/* 支付弹窗样式 */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.payment-modal {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.payment-modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.payment-modal-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.payment-modal-body {
  padding: 20px;
}

.payment-info-row {
  margin-bottom: 15px;
}

.payment-info-row:last-child {
  margin-bottom: 0;
}

.payment-info-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.payment-info-value {
  font-weight: 500;
  color: #333;
}

.payment-amount {
  font-size: 20px;
  color: #e9a84c;
}

.payment-methods {
  margin-top: 8px;
}

.payment-method-option {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
}

.payment-method-option input[type="radio"] {
  margin-right: 10px;
}

.payment-method-name {
  font-size: 14px;
}

.payment-modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-payment-btn,
.confirm-payment-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-payment-btn {
  background-color: #f0f0f0;
  color: #333;
}

.confirm-payment-btn {
  background-color: #e9a84c;
  color: white;
}

.cancel-payment-btn:hover {
  background-color: #e0e0e0;
}

.confirm-payment-btn:hover {
  background-color: #d89b44;
}

.confirm-payment-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 充值视图样式 */
.topup-view {
  max-width: 100%;
  width: 100%;
}

.topup-view .page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.topup-view .subtitle {
  color: #666;
  margin-top: -5px;
  margin-bottom: 25px;
}

.balance-display {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
}

.balance-display i {
  font-size: 22px;
  color: #e9a84c;
  margin-right: 10px;
}

.amount-options h3, .custom-amount h3, .payment-methods h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 12px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin-bottom: 25px;
}

.amount-btn {
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.amount-btn:hover {
  border-color: #e9a84c;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.amount-btn.selected {
  background: #e9a84c;
  border-color: #e9a84c;
  color: white;
}

.custom-amount {
  margin-bottom: 25px;
}

.input-group {
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 16px;
}

.custom-amount input {
  width: 100%;
  padding: 12px 15px 12px 30px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.custom-amount input:focus {
  border-color: #e9a84c;
  outline: none;
}

.payment-methods {
  margin-bottom: 25px;
}

.payment-options {
  display: flex;
  gap: 10px;
}

.payment-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-option:hover {
  border-color: #e9a84c;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.payment-option.selected {
  background: #f8f9fa;
  border-color: #e9a84c;
}

.payment-option i {
  font-size: 24px;
  color: #666;
}

.card-payment-form {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #e9a84c;
  outline: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.confirm-btn {
  width: 100%;
  padding: 15px;
  background: #e9a84c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-btn:hover:not(:disabled) {
  background: #d89638;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.topup-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

.topup-info i {
  color: #e9a84c;
  font-size: 18px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .amount-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-options {
    flex-direction: column;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

/* 设置视图样式 */
.settings-view {
  max-width: 100%;
  width: 100%;
}

.settings-view .page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.settings-view .subtitle {
  color: #666;
  margin-top: -5px;
  margin-bottom: 25px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.form-control {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.password-hint {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.error-message {
  font-size: 14px;
  color: #b91c1c;
  margin-top: 5px;
}

.update-btn {
  width: 100%;
  padding: 15px;
  background: #e9a84c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.update-btn:hover:not(:disabled) {
  background: #d89638;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.update-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
