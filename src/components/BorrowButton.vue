<template>
  <div class="borrow-button-container">
    <button
      @click="handleBorrow"
      class="borrow-button"
      :class="{ 'borrowed': isBorrowed, 'borrowing': isBorrowing }"
      :disabled="isLoading || isBorrowed || isBorrowing"
    >
      <span v-if="isLoading" class="loading-icon">
        <i class="fas fa-spinner fa-spin"></i>
      </span>
      <span v-else-if="isBorrowing" class="loading-icon">
        <i class="fas fa-spinner fa-spin"></i> Borrowing...
      </span>
      <span v-else-if="isBorrowed">
        Borrowed (Return date: {{ formattedDueDate }})
      </span>
      <span v-else>Borrow</span>
    </button>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { borrowBook } from '../api/borrowApi';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

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

const emit = defineEmits(['borrow', 'login-required']);
const userStore = useUserStore();
const router = useRouter();

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

// Check if user has already borrowed this book
onMounted(() => {
  // Check from localStorage or other storage if borrowed
  const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks') || '[]');
  const found = borrowedBooks.find(item => item.bookId === props.book.id);

  if (found) {
    isBorrowed.value = true;
    dueDate.value = found.dueDate;
  }
});

async function handleBorrow() {
  if (isLoading.value || isBorrowed.value) return;

  // Check if user is logged in
  if (!userStore.isAuthenticated) {
    // Trigger login required event for parent component to show login modal
    emit('login-required', 'borrow');
    return;
  }

  // Call parent component's borrow handling method
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

.borrow-button.borrowing {
  background-color: #f39c12;
  cursor: progress;
  box-shadow: 0 4px 6px rgba(243, 156, 18, 0.2);
}

.borrow-button:disabled {
  opacity: 0.8;
  cursor: not-allowed;
  transform: none;
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
