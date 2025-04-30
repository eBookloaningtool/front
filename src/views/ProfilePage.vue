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
        <div class="menu-item" :class="{ active: currentView === 'PaymentOrders' }">
          <a href="#" @click.prevent="switchView('PaymentOrders')">
            <span class="icon"><i class="ri-time-line"></i></span>
            <span class="text">Payment Records</span>
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
                  <span class="book-progress">阅读进度: {{ book.progress }}%</span>
                </div>
                <p class="book-author">{{ book.author }}</p>
                <div class="book-actions">
                  <button
                    @click="continueReading(book.id)"
                    class="read-btn"
                  >
                    继续阅读
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 借阅历史视图 -->
        <div v-if="currentView === 'LoanHistory'" class="loan-history">
          <h2 class="page-title">借阅历史</h2>
          <p class="subtitle">查看您的所有借阅记录</p>

          <div v-if="loadingLoans" class="loading-state">
            <p>加载中...</p>
          </div>

          <div v-else>
            <!-- 搜索和筛选 -->
            <div class="filter-container">
              <div class="search-input">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="搜索书名或作者..."
                  class="search-field"
                />
              </div>
              <div class="status-select">
                <select v-model="statusFilter" class="select-field">
                  <option value="all">全部</option>
                  <option value="active">借阅中</option>
                  <option value="returned">已归还</option>
                  <option value="overdue">已逾期</option>
                </select>
              </div>
            </div>

            <div v-if="filteredLoans.length === 0" class="empty-state">
              <p>没有找到符合条件的借阅记录</p>
            </div>

            <div v-else class="loans-table-container">
              <table class="loans-table">
                <thead>
                  <tr>
                    <th>图书信息</th>
                    <th>借阅日期</th>
                    <th>应归还日期</th>
                    <th>状态</th>
                    <th class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="loan in paginatedLoans" :key="loan.id">
                    <td>
                      <div class="book-info-cell">
                        <div class="loan-book-cover">
                          <img v-if="loan.book.cover" :src="loan.book.cover" :alt="loan.book.title" />
                        </div>
                        <div class="loan-book-meta">
                          <div class="loan-book-title" @click="viewBookDetails(loan.book.id)">
                            {{ loan.book.title }}
                          </div>
                          <div class="loan-book-author">{{ loan.book.author }}</div>
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
                          'status-active': loan.status === 'active',
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
                        延长借阅
                      </button>
                      <button
                        @click="viewLoanDetail(loan.id)"
                        class="detail-btn"
                      >
                        详情
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
                  上一页
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage >= totalPages"
                  class="page-btn"
                >
                  下一页
                </button>
              </div>
              <div class="pagination-desktop">
                <div class="pagination-info">
                  显示 <span>{{ paginationStart }}</span> 到 <span>{{ paginationEnd }}</span> 条，共 <span>{{ filteredLoans.length }}</span> 条记录
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
          <h2 class="page-title">我的愿望清单</h2>
          <p class="subtitle">管理您收藏的图书</p>

          <div v-if="loadingWishlist" class="loading-state">
            <p>加载中...</p>
          </div>

          <div v-else-if="wishlistItems.length === 0" class="empty-state">
            <p>您的愿望清单是空的</p>
            <router-link
              to="/books"
              class="browse-btn"
            >
              浏览图书馆
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
                <p class="wishlist-book-price">¥{{ book.price }}</p>
                <div class="wishlist-actions">
                  <button
                    @click="viewBookDetails(book.id)"
                    class="view-btn"
                  >
                    查看详情
                  </button>
                  <button
                    @click="removeFromWishlist(book.id)"
                    class="remove-btn"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论记录视图 -->
        <div v-if="currentView === 'MyReviews'" class="reviews">
          <h2 class="page-title">我的评论</h2>

          <div v-if="loadingReviews" class="loading-state">
            <p>加载中...</p>
          </div>

          <div v-else-if="reviews.length === 0" class="empty-state">
            <p>您还没有发表过评论</p>
            <router-link
              to="/books"
              class="browse-btn"
            >
              浏览图书
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
                    @click="editReview(review.id)"
                    class="edit-btn"
                  >
                    编辑
                  </button>
                  <button
                    @click="deleteReview(review.id)"
                    class="delete-btn"
                  >
                    删除
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
          <h2 class="page-title">支付和订单</h2>
          <p class="subtitle">管理您的订单和支付记录</p>

          <div v-if="loadingOrders" class="loading-state">
            <p>加载中...</p>
          </div>

          <div v-else>
            <!-- 切换标签 -->
            <div class="tab-container">
              <button
                v-for="tab in orderTabs"
                :key="tab.id"
                @click="currentOrderTab = tab.id"
                class="tab-button"
                :class="{ 'tab-active': currentOrderTab === tab.id }"
              >
                {{ tab.name }}
              </button>
            </div>

            <!-- 未支付订单 -->
            <div v-if="currentOrderTab === 'unpaid'" class="orders-list">
              <div v-if="unpaidOrders.length === 0" class="empty-state">
                <p>您没有待支付的订单</p>
                <router-link
                  to="/books"
                  class="browse-btn"
                >
                  浏览图书
                </router-link>
              </div>

              <div v-else>
                <div
                  v-for="order in unpaidOrders"
                  :key="order.id"
                  class="order-item"
                >
                  <div class="order-header">
                    <div class="order-info">
                      <span class="order-number">订单号: {{ order.orderNumber }}</span>
                      <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <span
                      class="order-status"
                      :class="{
                        'status-pending': order.status === 'pending',
                        'status-overdue': order.status === 'overdue'
                      }"
                    >
                      {{ getOrderStatusText(order.status) }}
                    </span>
                  </div>

                  <div class="order-content">
                    <div class="order-book">
                      <div class="order-book-cover">
                        <img
                          v-if="order.book && order.book.cover"
                          :src="order.book.cover"
                          :alt="order.book.title"
                        />
                      </div>
                      <div class="order-book-info">
                        <div
                          class="order-book-title"
                          @click="viewBookDetails(order.book.id)"
                        >
                          {{ order.book.title }}
                        </div>
                        <div class="order-book-author">{{ order.book.author }}</div>
                        <div class="order-type">
                          {{ order.type === 'purchase' ? '购买' : '租借' }} - ¥{{ order.amount.toFixed(2) }}
                        </div>
                      </div>
                    </div>

                    <div class="order-actions">
                      <button
                        @click="cancelOrder(order.id)"
                        class="cancel-btn"
                      >
                        取消
                      </button>
                      <button
                        @click="payOrder(order)"
                        class="pay-btn"
                      >
                        立即支付
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 已完成订单 -->
            <div v-else-if="currentOrderTab === 'completed'" class="orders-list">
              <div v-if="completedOrders.length === 0" class="empty-state">
                <p>您没有已完成的订单</p>
              </div>

              <div v-else>
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
                      {{ getOrderStatusText(order.status) }}
                    </span>
                  </div>

                  <div class="order-content">
                    <div class="order-book">
                      <div class="order-book-cover">
                        <img
                          v-if="order.book && order.book.cover"
                          :src="order.book.cover"
                          :alt="order.book.title"
                        />
                      </div>
                      <div class="order-book-info">
                        <div
                          class="order-book-title"
                          @click="viewBookDetails(order.book.id)"
                        >
                          {{ order.book.title }}
                        </div>
                        <div class="order-book-author">{{ order.book.author }}</div>
                        <div class="order-type">
                          {{ order.type === 'purchase' ? '购买' : '租借' }} - ¥{{ order.amount.toFixed(2) }}
                        </div>
                      </div>
                    </div>

                    <div class="order-payment-info">
                      <div class="payment-label">支付时间</div>
                      <div class="payment-value">{{ formatDate(order.paidAt) }}</div>
                    </div>
                  </div>

                  <div class="order-footer">
                    <button
                      @click="viewOrderDetail(order.id)"
                      class="detail-btn"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 已取消订单 -->
            <div v-else-if="currentOrderTab === 'cancelled'" class="orders-list">
              <div v-if="cancelledOrders.length === 0" class="empty-state">
                <p>您没有已取消的订单</p>
              </div>

              <div v-else>
                <div
                  v-for="order in cancelledOrders"
                  :key="order.id"
                  class="order-item cancelled"
                >
                  <div class="order-header">
                    <div class="order-info">
                      <span class="order-number">订单号: {{ order.orderNumber }}</span>
                      <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <span class="order-status status-cancelled">
                      已取消
                    </span>
                  </div>

                  <div class="order-content">
                    <div class="order-book">
                      <div class="order-book-cover">
                        <img
                          v-if="order.book && order.book.cover"
                          :src="order.book.cover"
                          :alt="order.book.title"
                        />
                      </div>
                      <div class="order-book-info">
                        <div
                          class="order-book-title"
                          @click="viewBookDetails(order.book.id)"
                        >
                          {{ order.book.title }}
                        </div>
                        <div class="order-book-author">{{ order.book.author }}</div>
                        <div class="order-type">
                          {{ order.type === 'purchase' ? '购买' : '租借' }} - ¥{{ order.amount.toFixed(2) }}
                        </div>
                      </div>
                    </div>

                    <div class="order-payment-info">
                      <div class="payment-label">取消时间</div>
                      <div class="payment-value">{{ formatDate(order.cancelledAt) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 支付对话框 -->
          <div v-if="showPaymentModal" class="payment-modal-overlay" @click.self="closePaymentModal">
            <div class="payment-modal">
              <div class="payment-modal-header">
                <h3 class="payment-modal-title">确认支付</h3>
              </div>
              <div class="payment-modal-body">
                <div class="payment-info-row">
                  <div class="payment-info-label">订单号</div>
                  <div class="payment-info-value">{{ currentOrder.orderNumber }}</div>
                </div>

                <div class="payment-info-row">
                  <div class="payment-info-label">图书</div>
                  <div class="payment-info-value">{{ currentOrder.book?.title }}</div>
                </div>

                <div class="payment-info-row">
                  <div class="payment-info-label">支付金额</div>
                  <div class="payment-info-value payment-amount">¥{{ currentOrder.amount?.toFixed(2) }}</div>
                </div>

                <div class="payment-info-row">
                  <div class="payment-info-label">选择支付方式</div>
                  <div class="payment-methods">
                    <label class="payment-method-option">
                      <input type="radio" v-model="paymentMethod" value="alipay" />
                      <span class="payment-method-name">支付宝</span>
                    </label>
                    <label class="payment-method-option">
                      <input type="radio" v-model="paymentMethod" value="wechat" />
                      <span class="payment-method-name">微信支付</span>
                    </label>
                    <label class="payment-method-option">
                      <input type="radio" v-model="paymentMethod" value="creditcard" />
                      <span class="payment-method-name">银行卡</span>
                    </label>
                  </div>
                </div>
              </div>
              <div class="payment-modal-footer">
                <button
                  @click="closePaymentModal"
                  class="cancel-payment-btn"
                >
                  取消
                </button>
                <button
                  @click="confirmPayment"
                  :disabled="!paymentMethod"
                  class="confirm-payment-btn"
                  :class="{ 'disabled': !paymentMethod }"
                >
                  确认支付
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Header from '../components/Header.vue';

const router = useRouter();
const route = useRoute();

const username = ref('测试用户');
const email = ref('test@example.com');
const registrationDate = ref('');
const balance = ref('0.00');
const userId = ref('');

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

// 支付记录标签页选项
const orderTabs = [
  { id: 'unpaid', name: '待支付' },
  { id: 'completed', name: '已完成' },
  { id: 'cancelled', name: '已取消' }
];

// 当前视图，默认为Profile
const currentView = ref('Profile');

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
  }
};

// 头像生成逻辑
const avatarUrl = computed(() => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username.value)}&background=random`;
});

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '未知';
  const d = new Date(dateStr);
  if (isNaN(d)) return '未知';

  // 转换为更友好的日期格式，例如 2023年10月15日
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year}年${month}月${day}日`;
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'active': return '借阅中';
    case 'returned': return '已归还';
    case 'overdue': return '已逾期';
    default: return status;
  }
};

// 登出方法
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('uuid');
  router.push('/login');
};

// 拉取用户信息
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 使用mock数据替代API调用
    username.value = '测试用户';
    email.value = 'test@example.com';

    // 模拟从API获取的注册时间
    const mockRegisterDate = new Date(2023, 5, 15); // 2023年6月15日
    registrationDate.value = formatDate(mockRegisterDate);

    balance.value = parseFloat(100).toFixed(2);
    userId.value = 'user123';

    // 实际API调用时，将使用API返回的注册时间
    // 例如：registrationDate.value = formatDate(response.data.registrationDate);
  } catch (error) {
    console.error('获取用户资料失败:', error);
    alert('加载用户信息失败，请稍后再试');
  }
};

// 获取最近借阅的图书
const fetchRecentBooks = async () => {
  loadingBooks.value = true;
  try {
    // 这里应该是API调用，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));
    recentBooks.value = [
      {
        id: 1,
        title: '三体',
        author: '刘慈欣',
        cover: '/images/books/threebody.jpg',
        progress: 45
      },
      {
        id: 2,
        title: '百年孤独',
        author: '加西亚·马尔克斯',
        cover: '/images/books/solitude.jpg',
        progress: 62
      }
    ];
  } catch (error) {
    console.error('获取最近阅读图书失败:', error);
  } finally {
    loadingBooks.value = false;
  }
};

// 获取借阅历史
const fetchLoanHistory = async () => {
  loadingLoans.value = true;
  try {
    // 这里应该是API调用，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟借阅数据
    loans.value = [
      {
        id: 1,
        book: {
          id: 101,
          title: '三体',
          author: '刘慈欣',
          cover: '/images/books/threebody.jpg'
        },
        borrowDate: '2023-10-15',
        dueDate: '2023-11-15',
        returnDate: null,
        status: 'active'
      },
      {
        id: 2,
        book: {
          id: 102,
          title: '百年孤独',
          author: '加西亚·马尔克斯',
          cover: '/images/books/solitude.jpg'
        },
        borrowDate: '2023-09-01',
        dueDate: '2023-10-01',
        returnDate: '2023-09-28',
        status: 'returned'
      },
      {
        id: 3,
        book: {
          id: 103,
          title: '追风筝的人',
          author: '卡勒德·胡赛尼',
          cover: '/images/books/kiterunner.jpg'
        },
        borrowDate: '2023-08-10',
        dueDate: '2023-09-10',
        returnDate: null,
        status: 'overdue'
      },
      {
        id: 4,
        book: {
          id: 104,
          title: '活着',
          author: '余华',
          cover: '/images/books/tolive.jpg'
        },
        borrowDate: '2023-07-22',
        dueDate: '2023-08-22',
        returnDate: '2023-08-20',
        status: 'returned'
      },
      {
        id: 5,
        book: {
          id: 105,
          title: '月亮与六便士',
          author: '毛姆',
          cover: '/images/books/moon.jpg'
        },
        borrowDate: '2023-06-15',
        dueDate: '2023-07-15',
        returnDate: '2023-07-10',
        status: 'returned'
      },
      {
        id: 6,
        book: {
          id: 106,
          title: '解忧杂货店',
          author: '东野圭吾',
          cover: '/images/books/grocery.jpg'
        },
        borrowDate: '2023-05-05',
        dueDate: '2023-06-05',
        returnDate: '2023-06-01',
        status: 'returned'
      }
    ];
  } catch (error) {
    console.error('获取借阅历史失败:', error);
  } finally {
    loadingLoans.value = false;
  }
};

// 获取愿望清单
const fetchWishlist = async () => {
  loadingWishlist.value = true;
  try {
    // 这里应该是API调用，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));
    wishlistItems.value = [
      {
        id: 1,
        title: '三体',
        author: '刘慈欣',
        cover: '/images/books/threebody.jpg',
        price: '49.00'
      },
      {
        id: 2,
        title: '百年孤独',
        author: '加西亚·马尔克斯',
        cover: '/images/books/solitude.jpg',
        price: '42.50'
      }
    ];
  } catch (error) {
    console.error('获取愿望清单失败:', error);
  } finally {
    loadingWishlist.value = false;
  }
};

// 获取评论记录
const fetchReviews = async () => {
  loadingReviews.value = true;
  try {
    // 这里应该是API调用，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));
    reviews.value = [
      {
        id: 1,
        bookId: 101,
        bookTitle: '三体',
        rating: 5,
        content: '这本书改变了我对科幻小说的看法，刘慈欣的想象力令人惊叹！',
        createdAt: '2023-09-15T14:30:00Z'
      },
      {
        id: 2,
        bookId: 102,
        bookTitle: '百年孤独',
        rating: 4,
        content: '马尔克斯的魔幻现实主义风格非常迷人，但有些段落需要反复阅读才能理解。',
        createdAt: '2023-08-22T10:15:00Z'
      }
    ];
  } catch (error) {
    console.error('获取评论失败:', error);
  } finally {
    loadingReviews.value = false;
  }
};

// 获取支付订单
const fetchOrders = async () => {
  loadingOrders.value = true;
  try {
    // 这里应该是API调用，现在用模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));

    // 模拟订单数据
    orders.value = [
      {
        id: 1,
        orderNumber: 'ORD202404150001',
        book: {
          id: 101,
          title: '三体',
          author: '刘慈欣',
          cover: '/images/books/threebody.jpg'
        },
        type: 'purchase',
        amount: 49.90,
        status: 'pending',
        createdAt: '2024-04-15T10:30:00Z',
        paidAt: null,
        cancelledAt: null
      },
      {
        id: 2,
        orderNumber: 'ORD202404120002',
        book: {
          id: 102,
          title: '百年孤独',
          author: '加西亚·马尔克斯',
          cover: '/images/books/solitude.jpg'
        },
        type: 'rental',
        amount: 15.00,
        status: 'overdue',
        createdAt: '2024-04-12T14:15:00Z',
        paidAt: null,
        cancelledAt: null
      },
      {
        id: 3,
        orderNumber: 'ORD202404100003',
        book: {
          id: 103,
          title: '活着',
          author: '余华',
          cover: '/images/books/tolive.jpg'
        },
        type: 'purchase',
        amount: 38.50,
        status: 'completed',
        createdAt: '2024-04-10T09:45:00Z',
        paidAt: '2024-04-10T09:50:00Z',
        cancelledAt: null
      },
      {
        id: 4,
        orderNumber: 'ORD202404050004',
        book: {
          id: 104,
          title: '月亮与六便士',
          author: '毛姆',
          cover: '/images/books/moon.jpg'
        },
        type: 'purchase',
        amount: 42.00,
        status: 'cancelled',
        createdAt: '2024-04-05T16:20:00Z',
        paidAt: null,
        cancelledAt: '2024-04-05T18:10:00Z'
      },
      {
        id: 5,
        orderNumber: 'ORD202404010005',
        book: {
          id: 105,
          title: '追风筝的人',
          author: '卡勒德·胡赛尼',
          cover: '/images/books/kiterunner.jpg'
        },
        type: 'rental',
        amount: 12.00,
        status: 'completed',
        createdAt: '2024-04-01T11:30:00Z',
        paidAt: '2024-04-01T11:35:00Z',
        cancelledAt: null
      }
    ];
  } catch (error) {
    console.error('获取订单数据失败:', error);
  } finally {
    loadingOrders.value = false;
  }
};

// 根据状态筛选订单
const unpaidOrders = computed(() => {
  return orders.value.filter(order => order.status === 'pending' || order.status === 'overdue');
});

const completedOrders = computed(() => {
  return orders.value.filter(order => order.status === 'completed');
});

const cancelledOrders = computed(() => {
  return orders.value.filter(order => order.status === 'cancelled');
});

// 获取订单状态文本
const getOrderStatusText = (status) => {
  switch (status) {
    case 'pending': return '待支付';
    case 'completed': return '已完成';
    case 'cancelled': return '已取消';
    case 'overdue': return '已逾期';
    default: return status;
  }
};

// 查看订单详情
const viewOrderDetail = (orderId) => {
  router.push(`/orders/${orderId}`);
};

// 取消订单
const cancelOrder = (orderId) => {
  if (confirm('确定要取消这个订单吗？')) {
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
  alert(`使用${paymentMethod.value === 'alipay' ? '支付宝' : paymentMethod.value === 'wechat' ? '微信支付' : '银行卡'}支付成功！`);
};

// 根据当前路由设置初始视图
onMounted(() => {
  // 获取用户信息
  fetchUserProfile();

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
      return loan.book.title.toLowerCase().includes(query) ||
              loan.book.author.toLowerCase().includes(query);
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
  router.push(`/loans/${loanId}`);
};

// 延长借阅
const extendLoan = (loanId) => {
  // 这里应该调用API延长借阅
  alert(`将会延长借阅ID: ${loanId}`);
};

// 继续阅读函数 - 页面跳转
const continueReading = (bookId) => {
  router.push(`/reader/${bookId}`);
};

// 查看图书详情
const viewBookDetails = (bookId) => {
  router.push(`/books/${bookId}`);
};

const deleteReview = (reviewId) => {
  if (confirm('确定要删除这条评论吗？')) {
    reviews.value = reviews.value.filter(review => review.id !== reviewId);
    // 这里应该有API调用来同步服务器数据
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

.book-progress {
  font-size: 14px;
  color: #666;
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
  border-radius: 50px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #e6f0ff;
  color: #3182ce;
}

.status-returned {
  background-color: #e6ffed;
  color: #2f855a;
}

.status-overdue {
  background-color: #ffebee;
  color: #e53e3e;
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

.edit-btn, .delete-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #f0f0f0;
  color: #333;
}

.delete-btn {
  background-color: #fee2e2;
  color: #b91c1c;
}

.edit-btn:hover {
  background-color: #e0e0e0;
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
</style>
