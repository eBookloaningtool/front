<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">支付和订单</h1>
          <p class="text-gray-500 mt-1">管理您的订单和支付记录</p>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-4">
            <p class="text-gray-500">加载中...</p>
          </div>
          <div v-else>
            <!-- 切换标签 -->
            <div class="mb-6 border-b border-gray-200">
              <nav class="flex -mb-px">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="currentTab = tab.id"
                  class="py-2 px-4 text-center border-b-2 font-medium text-sm"
                  :class="[
                    currentTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  ]"
                >
                  {{ tab.name }}
                </button>
              </nav>
            </div>

            <!-- 未支付订单 -->
            <div v-if="currentTab === 'unpaid'" class="space-y-4">
              <div v-if="unpaidOrders.length === 0" class="text-center py-10">
                <p class="text-gray-500">您没有待支付的订单</p>
                <RouterLink
                  to="/books"
                  class="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  浏览图书
                </RouterLink>
              </div>

              <div v-else>
                <div
                  v-for="order in unpaidOrders"
                  :key="order.id"
                  class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                >
                  <div class="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                      <span class="text-sm font-medium text-gray-900">订单号: {{ order.orderNumber }}</span>
                      <span class="ml-4 text-sm text-gray-500">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <span
                      class="px-2 py-1 text-xs font-medium rounded-full"
                      :class="{
                        'bg-yellow-100 text-yellow-800': order.status === 'pending',
                        'bg-red-100 text-red-800': order.status === 'overdue'
                      }"
                    >
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>

                  <div class="p-4">
                    <div class="flex items-center mb-4">
                      <div class="flex-shrink-0 h-16 w-12 bg-gray-100 rounded overflow-hidden">
                        <img
                          v-if="order.book && order.book.cover"
                          :src="order.book.cover"
                          :alt="order.book.title"
                          class="h-full w-full object-cover"
                        />
                      </div>
                      <div class="ml-4 flex-1">
                        <div
                          class="text-sm font-medium text-blue-600 cursor-pointer"
                          @click="viewBookDetails(order.book.id)"
                        >
                          {{ order.book.title }}
                        </div>
                        <div class="text-sm text-gray-500">{{ order.book.author }}</div>
                        <div class="text-sm font-medium text-gray-900 mt-1">
                          {{ order.type === 'purchase' ? '购买' : '租借' }} - £{{ order.amount.toFixed(2) }}
                        </div>
                      </div>
                    </div>

                    <div class="mt-4 flex justify-end space-x-3">
                      <button
                        @click="cancelOrder(order.id)"
                        class="px-3 py-1 border border-gray-300 text-sm rounded text-gray-700 hover:bg-gray-50"
                      >
                        取消
                      </button>
                      <button
                        @click="payOrder(order)"
                        class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        立即支付
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 已完成订单 -->
            <div v-else-if="currentTab === 'completed'" class="space-y-4">
              <div v-if="completedOrders.length === 0" class="text-center py-10">
                <p class="text-gray-500">您没有已完成的订单</p>
              </div>

              <div v-else>
                <div
                  v-for="order in completedOrders"
                  :key="order.id"
                  class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                >
                  <div class="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                      <span class="text-sm font-medium text-gray-900">订单号: {{ order.orderNumber }}</span>
                      <span class="ml-4 text-sm text-gray-500">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>

                  <div class="p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-16 w-12 bg-gray-100 rounded overflow-hidden">
                        <img
                          v-if="order.book && order.book.cover"
                          :src="order.book.cover"
                          :alt="order.book.title"
                          class="h-full w-full object-cover"
                        />
                      </div>
                      <div class="ml-4 flex-1">
                        <div
                          class="text-sm font-medium text-blue-600 cursor-pointer"
                          @click="viewBookDetails(order.book.id)"
                        >
                          {{ order.book.title }}
                        </div>
                        <div class="text-sm text-gray-500">{{ order.book.author }}</div>
                        <div class="text-sm font-medium text-gray-900 mt-1">
                          {{ order.type === 'purchase' ? '购买' : '租借' }} - £{{ order.amount.toFixed(2) }}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm text-gray-500">支付时间</div>
                        <div class="text-sm font-medium">{{ formatDate(order.paidAt) }}</div>
                      </div>
                    </div>

                    <div class="mt-4 flex justify-end">
                      <button
                        @click="viewOrderDetail(order.id)"
                        class="px-3 py-1 border border-gray-300 text-sm rounded text-gray-700 hover:bg-gray-50"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 已取消订单 -->
            <div v-else-if="currentTab === 'cancelled'" class="space-y-4">
              <div v-if="cancelledOrders.length === 0" class="text-center py-10">
                <p class="text-gray-500">您没有已取消的订单</p>
              </div>

              <div v-else>
                <div
                  v-for="order in cancelledOrders"
                  :key="order.id"
                  class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm opacity-75"
                >
                  <div class="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div>
                      <span class="text-sm font-medium text-gray-900">订单号: {{ order.orderNumber }}</span>
                      <span class="ml-4 text-sm text-gray-500">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      已取消
                    </span>
                  </div>

                  <div class="p-4">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-16 w-12 bg-gray-100 rounded overflow-hidden">
                        <img
                          v-if="order.book && order.book.cover"
                          :src="order.book.cover"
                          :alt="order.book.title"
                          class="h-full w-full object-cover"
                        />
                      </div>
                      <div class="ml-4 flex-1">
                        <div
                          class="text-sm font-medium text-blue-600 cursor-pointer"
                          @click="viewBookDetails(order.book.id)"
                        >
                          {{ order.book.title }}
                        </div>
                        <div class="text-sm text-gray-500">{{ order.book.author }}</div>
                        <div class="text-sm font-medium text-gray-900 mt-1">
                          {{ order.type === 'purchase' ? '购买' : '租借' }} - £{{ order.amount.toFixed(2) }}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm text-gray-500">取消时间</div>
                        <div class="text-sm font-medium">{{ formatDate(order.cancelledAt) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付对话框 -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg w-full max-w-md overflow-hidden shadow-xl">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">确认支付</h3>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">订单号</p>
            <p class="font-medium">{{ currentOrder.orderNumber }}</p>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">图书</p>
            <p class="font-medium">{{ currentOrder.book?.title }}</p>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-600 mb-2">支付金额</p>
            <p class="text-xl font-bold text-blue-600">£{{ currentOrder.amount?.toFixed(2) }}</p>
          </div>

          <div class="mb-6">
            <p class="text-sm text-gray-600 mb-2">选择支付方式</p>
            <div class="mt-2 space-y-2">
              <label class="flex items-center space-x-3">
                <input type="radio" v-model="paymentMethod" value="alipay" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                <span class="text-gray-900">支付宝</span>
              </label>
              <label class="flex items-center space-x-3">
                <input type="radio" v-model="paymentMethod" value="wechat" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                <span class="text-gray-900">微信支付</span>
              </label>
              <label class="flex items-center space-x-3">
                <input type="radio" v-model="paymentMethod" value="creditcard" class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300" />
                <span class="text-gray-900">银行卡</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closePaymentModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              取消
            </button>
            <button
              @click="confirmPayment"
              :disabled="!paymentMethod"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              确认支付
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 获取路由实例
const router = useRouter();

// 响应式状态
const loading = ref(true);
const orders = ref([]);
const currentTab = ref('unpaid');
const showPaymentModal = ref(false);
const currentOrder = ref({});
const paymentMethod = ref('alipay');

// 标签页选项
const tabs = [
  { id: 'unpaid', name: '待支付' },
  { id: 'completed', name: '已完成' },
  { id: 'cancelled', name: '已取消' }
];

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 'pending': return '待支付';
    case 'completed': return '已完成';
    case 'cancelled': return '已取消';
    case 'overdue': return '已逾期';
    default: return status;
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

// 查看图书详情
const viewBookDetails = (bookId) => {
  router.push(`/books/${bookId}`);
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

// 模拟获取订单数据
onMounted(async () => {
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
    loading.value = false;
  }
});
</script>
