<template>
  <div class="borrow-button-container">
    <button
      @click="handleBorrow"
      class="borrow-button"
      :class="{ 'borrowed': isBorrowed }"
      :disabled="isLoading || isBorrowed || isBorrowing"
    >
      <span v-if="isLoading || isBorrowing" class="loading-icon">
        <i class="fas fa-spinner fa-spin"></i>
      </span>
      <span v-else-if="isBorrowed">
        已借阅 (归还日期: {{ formattedDueDate }})
      </span>
      <span v-else>借阅此书</span>
    </button>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { borrowBook } from '../api/borrowApi';

const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  isBorrowing: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['borrow']);

const isLoading = ref(false);
const isBorrowed = ref(false);
const dueDate = ref(null);
const message = ref('');
const messageType = ref('success');

const formattedDueDate = computed(() => {
  if (!dueDate.value) return '';

  const date = new Date(dueDate.value);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
});

// 检查用户是否已经借阅了这本书
onMounted(() => {
  // 从localStorage或其他存储中检查是否已借阅
  const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
  const bookId = props.book.id || props.book.bookId; // 兼容两种可能的ID字段
  const found = borrowedBooks.find(item =>
    item.bookId === bookId ||
    (item.bookId === String(bookId)) ||
    (item.id && (item.id === bookId || item.id === String(bookId)))
  );

  if (found) {
    isBorrowed.value = true;
    dueDate.value = found.dueDate;
  }
});

async function handleBorrow() {
  if (isLoading.value || isBorrowed.value) return;

  // 调用父组件的借阅处理方法
  emit('borrow');
}
</script>

<style scoped>
.borrow-button-container {
  width: 100%;
}

.borrow-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-weight: 500;
  width: 100%;
  box-shadow: 0 4px 6px rgba(46, 204, 113, 0.2);
}

.borrow-button:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(46, 204, 113, 0.3);
}

.borrow-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(46, 204, 113, 0.2);
}

.borrow-button.borrowed {
  background-color: #3498db;
  cursor: default;
}

.borrow-button:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-icon {
  margin-right: 8px;
}

.message {
  margin-top: 15px;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  animation: fadeIn 0.3s ease;
}

.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

.error {
  background-color: #ffebee;
  color: #c62828;
  border-left: 4px solid #c62828;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
