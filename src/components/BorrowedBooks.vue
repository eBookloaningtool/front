<!-- src/components/BorrowedBooks.vue -->
<template>
  <div class="borrowed-books">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchBooks" class="btn-retry">Retry</button>
    </div>

    <div v-else-if="books.length === 0" class="empty-state">
      <p>You currently have no borrowed books</p>
    </div>

    <div v-else class="books-grid">
      <div v-for="book in books" :key="book.bookId" class="book-card">
        <div class="book-cover">
          <img :src="book.coverUrl || '/default-book-cover.jpg'" :alt="book.title" class="cover-img" />
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
          <div class="due-date">
            <span class="due-label">Due Date:</span>
            <span class="due-value">{{ book.dueDate }}</span>
          </div>
        </div>
        <div class="book-actions">
          <button @click="returnBook(book.bookId)" class="btn-return">Return</button>
          <router-link :to="'/book/' + book.bookId" class="btn-view">View Details</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, watch } from 'vue';
import { getBorrowList, returnBook as apiReturnBook } from '@/api/borrowApi.ts';

const props = defineProps({
  // 可以接受外部传入的 bookIds，也可以自行通过 API 获取
  bookIds: {
    type: Array,
    default: () => []
  },
  // 是否使用 API 获取借阅列表
  useApi: {
    type: Boolean,
    default: true
  }
});

const books = ref([]);
const loading = ref(false);
const error = ref(null);

// 监听 props 变化
watch(() => [props.bookIds, props.useApi], () => {
  fetchBooks();
}, { immediate: true });

// 获取书籍详情
const fetchBooks = async () => {
  loading.value = true;
  error.value = null;
  books.value = [];

  try {
    let bookList = [];

    if (props.useApi) {
      const response = await getBorrowList();
      if (response.state === 'success') {
        bookList = response.data;
      } else {
        throw new Error('Failed to get borrowing list');
      }
    } else if (props.bookIds.length > 0) {
      bookList = props.bookIds.map(id => ({ bookId: id }));
    }

    if (bookList.length === 0) {
      loading.value = false;
      return;
    }

    const bookPromises = bookList.map(item =>
      fetch(`/api/books/get?bookId=${item.bookId}`)
        .then(response => {
          if (!response.ok) throw new Error(`Failed to get book ${item.bookId}`);
          return response.json();
        })
    );

    const booksData = await Promise.all(bookPromises);
    books.value = booksData;
  } catch (err) {
    console.error('Error getting borrowed books:', err);
    error.value = 'Failed to get book information, please try again later';
  } finally {
    loading.value = false;
  }
};


// 归还书籍
const returnBook = async (bookId) => {
  try {
    const result = await apiReturnBook(bookId);
    if (result.state === 'success') {
      // 成功提示
      this.$message.success('Return successful!');

      // 重新拉取借阅列表
      await fetchBooks();
    } else {
      this.$message.error('Return failed, please try again later');
    }
  } catch (error) {
    console.error('Error returning book:', error);
    this.$message.error('Return failed, please try again later');
  }
};

// 组件挂载时获取借阅列表
onMounted(() => {
  fetchBooks();
});
</script>

<style scoped>
.borrowed-books {
  width: 100%;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.book-cover {
  height: 180px;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.book-card:hover .cover-img {
  transform: scale(1.05);
}

.book-info {
  padding: 1rem;
  flex-grow: 1;
}

.book-title {
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
  color: #333;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.8rem;
}

.book-author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.due-date {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.due-label {
  color: #888;
}

.due-value {
  color: #e74c3c;
  font-weight: 500;
}

.book-actions {
  display: flex;
  padding: 0.75rem;
  gap: 0.5rem;
  border-top: 1px solid #f0f0f0;
}

.book-actions button,
.book-actions a {
  flex: 1;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 500;
}

.btn-return {
  background-color: #ecf0f1;
  color: #34495e;
  border: none;
}

.btn-view {
  background-color: #f0c080;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-return:hover {
  background-color: #d6dbdf;
}

.btn-view:hover {
  background-color: #e0a060;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #888;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #f0c080;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #f0c080;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-retry:hover {
  background-color: #e0a060;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }
}

@media (max-width: 480px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
}
</style>
