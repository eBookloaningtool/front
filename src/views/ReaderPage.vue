<template>
  <div class="reader-container">
    <div class="reader-header">
      <button @click="goBack" class="back-button">
        <span class="icon">←</span> Back
      </button>
      <h1 class="book-title">{{ bookTitle }}</h1>
      <div class="book-info">
        <span v-if="author">Author: {{ author }}</span>
      </div>
    </div>

    <div class="reader-controls">
      <div class="font-size-controls">
        <button @click="decreaseFontSize" class="control-button">A-</button>
        <span class="font-size-display">{{ fontSize }}px</span>
        <button @click="increaseFontSize" class="control-button">A+</button>
      </div>
    </div>

    <div class="reader-content" v-if="content" :style="{ fontSize: `${fontSize}px` }">
      <div v-html="currentPageContent"></div>
    </div>

    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <div class="pagination-controls" v-if="content">
      <button @click="prevPage" :disabled="currentPage <= 1" class="pagination-button">Previous</button>
      <span class="page-indicator">{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages" class="pagination-button">Next</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getBookContent } from '@/api/books';
import { getBookDetail } from '@/api/books';

export default defineComponent({
  name: 'ReaderPage',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const content = ref<string>('');
    const bookTitle = ref<string>('');
    const author = ref<string>('');
    const isLoading = ref<boolean>(true);
    const error = ref<string | null>(null);
    const fontSize = ref<number>(18); // Default font size
    const currentPage = ref<number>(1);
    const wordsPerPage = ref<number>(500); // Adjust based on font size and container size
    const contentPages = ref<string[]>([]);

    // Adjust font size
    const increaseFontSize = () => {
      if (fontSize.value < 24) {
        fontSize.value += 2;
        updatePagination();
      }
    };

    const decreaseFontSize = () => {
      if (fontSize.value > 14) {
        fontSize.value -= 2;
        updatePagination();
      }
    };

    // Pagination calculation
    const updatePagination = () => {
      if (!content.value) return;

      // Adjust words per page based on font size
      const adjustedWordsPerPage = Math.floor(wordsPerPage.value * (18 / fontSize.value));

      // Remove HTML tags, keep only text content for pagination
      const plainText = content.value.replace(/<[^>]*>/g, '');

      // Split into pages based on adjusted words per page
      const pages = [];
      let currentPosition = 0;

      while (currentPosition < plainText.length) {
        const endPosition = Math.min(currentPosition + adjustedWordsPerPage, plainText.length);
        pages.push(content.value.slice(currentPosition, endPosition));
        currentPosition = endPosition;
      }

      contentPages.value = pages;

      // Ensure current page is within valid range
      if (currentPage.value > contentPages.value.length) {
        currentPage.value = contentPages.value.length;
      }
    };

    // Calculate total pages
    const totalPages = computed(() => contentPages.value.length);

    // Get current page content
    const currentPageContent = computed(() => {
      if (contentPages.value.length === 0) return '';
      return contentPages.value[currentPage.value - 1] || '';
    });

    // Page turning functionality
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
        saveReadingProgress();
      }
    };

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        saveReadingProgress();
      }
    };

    // Save reading progress
    const saveReadingProgress = () => {
      const bookId = route.params.id as string;
      if (!bookId) return;

      const readingProgress = {
        page: currentPage.value,
        fontSize: fontSize.value
      };

      localStorage.setItem(`reading_progress_${bookId}`, JSON.stringify(readingProgress));
    };

    // Load reading progress
    const loadReadingProgress = () => {
      const bookId = route.params.id as string;
      if (!bookId) return;

      const savedProgress = localStorage.getItem(`reading_progress_${bookId}`);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          currentPage.value = progress.page || 1;
          fontSize.value = progress.fontSize || 18;
        } catch (e) {
          console.error('Unable to parse saved reading progress', e);
        }
      }
    };

    const goBack = () => {
      router.back();
    };

    const loadBookContent = async () => {
      const bookId = route.params.id as string;
      if (!bookId) {
        error.value = 'Invalid book ID';
        return;
      }

      try {
        // Load book information
        const bookInfo = await getBookDetail(bookId);
        if (bookInfo) {
          bookTitle.value = bookInfo.title || 'Unknown Title';
          author.value = bookInfo.author || 'Unknown Author';
        }

        // Load book content
        const response = await getBookContent(bookId);
        if (response && response.content) {
          content.value = response.content;
          updatePagination();
          loadReadingProgress();
        } else {
          error.value = 'Unable to load book content';
        }
      } catch (err) {
        console.error('Failed to load book content:', err);
        error.value = 'Error loading book content';
      } finally {
        isLoading.value = false;
      }
    };

    // Watch for font size changes, update pagination
    watch(fontSize, () => {
      updatePagination();
      saveReadingProgress();
    });

    onMounted(() => {
      loadBookContent();
    });

    return {
      content,
      bookTitle,
      author,
      isLoading,
      error,
      goBack,
      fontSize,
      increaseFontSize,
      decreaseFontSize,
      currentPage,
      totalPages,
      nextPage,
      prevPage,
      currentPageContent
    };
  }
});
</script>

<style scoped>
.reader-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.reader-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.back-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.back-button:hover {
  color: #000;
}

.icon {
  margin-right: 0.5rem;
}

.book-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.book-info {
  color: #666;
  font-size: 1rem;
}

.reader-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.font-size-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-button {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.control-button:hover {
  background-color: #e0e0e0;
}

.font-size-display {
  font-size: 0.9rem;
  width: 3rem;
  text-align: center;
}

.reader-content {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #333;
  min-height: 60vh;
  margin-bottom: 2rem;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.pagination-button {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.page-indicator {
  font-size: 0.9rem;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
