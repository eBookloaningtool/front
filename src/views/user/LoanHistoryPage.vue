<template>
  <div class="min-h-screen bg-gray-50 py-8">
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
console.log('LoanHistoryPage 组件开始初始化');

import { ref, computed, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { getBorrowHistory } from '../../api/borrowApi';
import { getBookDetail } from '../../api/books';

// 获取路由实例
const router = useRouter();

// 响应式状态
const loading = ref(true);
const loans = ref([]);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const pageSize = 5;
const error = ref('');

onBeforeMount(() => {
  console.log('LoanHistoryPage 组件即将挂载');
});

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

// 获取借阅历史数据
onMounted(async () => {
  console.log('LoanHistoryPage 组件已挂载，开始获取数据');
  try {
    console.log('开始获取借阅历史数据...');
    loading.value = true;
    error.value = '';
    
    // 从API获取借阅历史数据
    console.log('正在调用 getBorrowHistory API...');
    const response = await getBorrowHistory();
    console.log('getBorrowHistory API 响应:', {
      state: response.state,
      dataLength: response.data?.length,
      data: response.data
    });
    
    if (response.state === 'success' && response.data) {
      console.log('开始处理借阅历史数据，共', response.data.length, '条记录');
      
      // 获取每本书的详细信息
      const bookDetails = await Promise.all(
        response.data.map(async (borrow, index) => {
          try {
            console.log(`正在获取第 ${index + 1} 本书的详情，bookId:`, borrow.bookId);
            const bookDetail = await getBookDetail(borrow.bookId);
            console.log(`第 ${index + 1} 本书的详情:`, {
              bookId: borrow.bookId,
              title: bookDetail?.title,
              author: bookDetail?.author,
              cover: bookDetail?.coverUrl || bookDetail?.cover
            });
            
            if (bookDetail) {
              return {
                id: borrow.borrowId,
                book: {
                  id: borrow.bookId,
                  title: bookDetail.title,
                  author: bookDetail.author,
                  cover: bookDetail.coverUrl || bookDetail.cover
                },
                borrowDate: borrow.borrowDate,
                dueDate: borrow.dueDate,
                returnDate: borrow.returnDate,
                status: borrow.status
              };
            }
            console.warn(`第 ${index + 1} 本书获取详情失败，bookId:`, borrow.bookId);
            return null;
          } catch (err) {
            console.error(`获取第 ${index + 1} 本书详情时出错:`, err);
            return null;
          }
        })
      );
      
      // 过滤掉获取失败的书籍
      const validBooks = bookDetails.filter(book => book !== null);
      console.log('数据处理完成:', {
        原始数据条数: response.data.length,
        有效数据条数: validBooks.length,
        无效数据条数: response.data.length - validBooks.length,
        最终数据: validBooks
      });
      
      loans.value = validBooks;
    } else {
      console.warn('API返回状态不是success或数据为空:', {
        state: response.state,
        hasData: !!response.data
      });
      loans.value = [];
    }
  } catch (err) {
    console.error('获取借阅历史时发生错误:', err);
    error.value = '获取借阅历史失败，请稍后重试';
    loans.value = [];
  } finally {
    loading.value = false;
    console.log('借阅历史数据加载完成，当前状态:', {
      loading: loading.value,
      error: error.value,
      loansCount: loans.value.length
    });
  }
});
</script> 