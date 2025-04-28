<!-- BookList.vue -->
<template>
  <div class="book-list-section">
    <!-- 标题部分 -->
    <div class="book-list-header" v-if="showHeader">
      <h2 class="title">{{ title }}</h2>
      <router-link v-if="moreLink" :to="moreLink" class="view-more">
        查看更多 <i class="ri-arrow-right-s-line"></i>
      </router-link>
    </div>

    <!-- 加载中状态 -->
    <div v-if="isLoading" class="loading">
      <div class="simple-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMessage" class="error">
      <p>{{ errorMessage }}</p>
      <button @click="$emit('retry')" class="retry-btn">重试</button>
    </div>

    <!-- 正常显示书籍 -->
    <div v-else-if="displayBooks.length > 0" :class="['book-container', layoutClass]">
      <template v-if="useSimpleLayout">
        <div v-for="book in displayBooks" :key="book.id" class="book-item">
          <router-link :to="`/book/${book.id}`" class="book-link">
            <div class="book-cover-container">
              <img
                :src="book.cover"
                :alt="book.title"
                @error="e => e.target.src = defaultCover"
              />
            </div>
            <div class="book-info">
              <h3 class="book-title">{{ book.title }}</h3>
              <p class="book-author">{{ book.author }}</p>
            </div>
          </router-link>
        </div>
      </template>
      <template v-else>
        <BookCard
          v-for="book in displayBooks"
          :key="book.id"
          :book="book"
          :showRating="showRating"
          :showWishlist="showWishlist"
        />
      </template>
    </div>

    <!-- 没有数据 -->
    <div v-else class="empty-state">
      <p>暂无数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import BookCard from './BookCard.vue'

const props = defineProps({
  title: { type: String, default: '' },
  moreLink: { type: String, default: '' },
  books: { type: Array, default: () => [] },
  loadBooks: { type: Function, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  layout: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'simple', 'list'].includes(value)
  },
  showRating: { type: Boolean, default: true },
  showWishlist: { type: Boolean, default: true },
  showHeader: { type: Boolean, default: true }
});

const emit = defineEmits(['retry']);

const defaultCover = 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback';
const localBooks = ref([]);
const localLoading = ref(!!props.loadBooks);
const localError = ref('');

const isLoading = computed(() => props.loading || localLoading.value);
const errorMessage = computed(() => props.error || localError.value);
const displayBooks = computed(() => props.books.length > 0 ? props.books : localBooks.value);

const useSimpleLayout = computed(() => ['simple', 'list'].includes(props.layout));
const layoutClass = computed(() => {
  switch (props.layout) {
    case 'simple': return 'simple-layout';
    case 'list': return 'list-layout';
    default: return 'grid-layout';
  }
});

onMounted(async () => {
  if (props.loadBooks) {
    localLoading.value = true;
    try {
      localBooks.value = await props.loadBooks();
    } catch (error) {
      console.error('获取书籍列表失败:', error);
      localError.value = '获取数据失败，请稍后再试';
    } finally {
      localLoading.value = false;
    }
  }
});
</script>

<style scoped>
.book-list-section {
  margin-bottom: 40px;
}

/* Header 样式 */
.book-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.title {
  font-size: 20px;
  color: #333;
}

.view-more {
  color: #e9a84c;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.view-more:hover {
  color: #d89638;
}

/* Loading 样式 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #666;
}

.simple-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-top-color: #e9a84c;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误、重试 */
.error {
  text-align: center;
  color: #e74c3c;
  padding: 20px;
}

.retry-btn {
  margin-top: 10px;
  background: #e9a84c;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.retry-btn:hover {
  background: #d89638;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #777;
  font-style: italic;
}

/* 网格布局 */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
}

/* 简单布局 */
.simple-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
}

/* 列表布局 */
.list-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 768px) {
  .grid-layout, .simple-layout {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 480px) {
  .grid-layout, .simple-layout {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
