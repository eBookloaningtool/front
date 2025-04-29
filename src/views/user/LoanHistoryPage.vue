<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-8">
    <div class="container mx-auto px-4 max-w-4xl">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-800">借阅历史</h1>
          <p class="text-gray-500 mt-1">查看您的所有借阅记录</p>
        </div>
        <div class="p-6">
          <div v-if="loading" class="text-center py-4">
            <p class="text-gray-500">加载中...</p>
          </div>
          <div v-else>
            <!-- 搜索和筛选 -->
            <div class="mb-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div class="flex-1">
                <input
                  type="text"
                  v-model="searchQuery"
                  placeholder="搜索书名或作者..."
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  v-model="statusFilter"
                  class="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">全部</option>
                  <option value="active">借阅中</option>
                  <option value="returned">已归还</option>
                  <option value="overdue">已逾期</option>
                </select>
              </div>
            </div>

            <div v-if="filteredLoans.length === 0" class="text-center py-10">
              <p class="text-gray-500">没有找到符合条件的借阅记录</p>
            </div>

            <div v-else>
              <!-- 借阅记录表格 -->
              <div class="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        图书信息
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        借阅日期
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        应归还日期
                      </th>
                      <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="loan in paginatedLoans" :key="loan.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                          <div class="flex-shrink-0 h-16 w-12 bg-gray-100 rounded overflow-hidden">
                            <img v-if="loan.book.cover" :src="loan.book.cover" :alt="loan.book.title" class="h-full w-full object-cover" />
                          </div>
                          <div class="ml-4">
                            <div class="text-sm font-medium text-blue-600 cursor-pointer" @click="viewBookDetails(loan.book.id)">
                              {{ loan.book.title }}
                            </div>
                            <div class="text-sm text-gray-500">{{ loan.book.author }}</div>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ formatDate(loan.borrowDate) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ formatDate(loan.dueDate) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="{
                            'bg-green-100 text-green-800': loan.status === 'returned',
                            'bg-blue-100 text-blue-800': loan.status === 'active',
                            'bg-red-100 text-red-800': loan.status === 'overdue'
                          }"
                        >
                          {{ getStatusText(loan.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          v-if="loan.status === 'active'"
                          @click="extendLoan(loan.id)"
                          class="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          延长借阅
                        </button>
                        <button
                          @click="viewLoanDetail(loan.id)"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 分页控件 -->
              <div class="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
                <div class="flex-1 flex justify-between sm:hidden">
                  <button
                    @click="prevPage"
                    :disabled="currentPage === 1"
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    @click="nextPage"
                    :disabled="currentPage >= totalPages"
                    class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p class="text-sm text-gray-700">
                      显示 <span class="font-medium">{{ paginationStart }}</span> 到 <span class="font-medium">{{ paginationEnd }}</span> 条，共 <span class="font-medium">{{ filteredLoans.length }}</span> 条记录
                    </p>
                  </div>
                  <div>
                    <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        @click="prevPage"
                        :disabled="currentPage === 1"
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span class="sr-only">上一页</span>
                        &lt;
                      </button>

                      <button
                        v-for="page in displayedPages"
                        :key="page"
                        @click="goToPage(page)"
                        :class="[
                          'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        ]"
                      >
                        {{ page }}
                      </button>

                      <button
                        @click="nextPage"
                        :disabled="currentPage >= totalPages"
                        class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span class="sr-only">下一页</span>
                        &gt;
                      </button>
                    </nav>
                  </div>
                </div>
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
import { useRouter } from 'vue-router';

// 获取路由实例
const router = useRouter();

// 响应式状态
const loading = ref(true);
const loans = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = 5;

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('zh-CN').format(date);
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

// 分页计算
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

// 查看图书详情
const viewBookDetails = (bookId) => {
  router.push(`/books/${bookId}`);
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

// 模拟获取借阅数据
onMounted(async () => {
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
    loading.value = false;
  }
});
</script>
