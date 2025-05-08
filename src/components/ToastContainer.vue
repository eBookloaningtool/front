<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast', `toast-${toast.type}`]"
        v-show="toast.show"
      >
        <i v-if="toast.type === 'success'" class="ri-check-line"></i>
        <i v-else-if="toast.type === 'error'" class="ri-error-warning-line"></i>
        <i v-else-if="toast.type === 'warning'" class="ri-alert-line"></i>
        <i v-else class="ri-information-line"></i>
        <span>{{ toast.message }}</span>

        <button class="close-btn" @click.stop="closeToast(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast';

// Get Toasts list
const { toasts } = useToast();
const closeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index !== -1) {
    toasts.value[index].show = false;
    setTimeout(() => {
      toasts.value.splice(index, 1);
    }, 300);
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  margin-left: auto;
  cursor: pointer;
  padding: 0 5px;
  pointer-events: auto;
}

.close-btn:hover {
  color: #ccc;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 300px;
  pointer-events: auto;
}

.toast i {
  font-size: 16px;
}

.toast-success {
  background-color: #4CAF50;
}

.toast-error {
  background-color: #F44336;
}

.toast-warning {
  background-color: #FF9800;
}

.toast-info {
  background-color: #2196F3;
}

/* Animation effect */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
