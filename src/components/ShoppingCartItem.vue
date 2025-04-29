<!-- ShoppingCartItem.vue -->
<template>
  <div class="cart-item">
    <div class="item-cover">
      <img
        :src="book.coverUrl"
        :alt="book.title"
        @error="handleImageError"
      />
    </div>
    <div class="item-details">
      <h3 class="item-title">{{ book.title }}</h3>
      <p class="item-author">作者: {{ book.author }}</p>
      <p class="item-price">£5</p>
    </div>
    <div class="item-actions">
      <button @click="removeFromCart" class="remove-btn">
        <i class="ri-delete-bin-line"></i>
        移除
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['remove']);

const handleImageError = (event) => {
  event.target.src = '/images/default-book-cover.jpg';
};

const removeFromCart = () => {
  emit('remove', props.book.bookId);
};
</script>

<style scoped>
.cart-item {
  display: flex;
  background: white;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.item-cover {
  width: 90px;
  height: 120px;
  overflow: hidden;
  border-radius: 5px;
  background-color: #f0f0f0;
  margin-right: 15px;
  flex-shrink: 0;
}

.item-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 5px;
}

.item-author {
  font-size: 14px;
  color: #666;
  margin: 0 0 5px;
}

.item-price {
  font-size: 18px;
  font-weight: 600;
  color: #e9a84c;
  margin: 8px 0 0;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
}

.remove-btn {
  background: transparent;
  color: #ff5252;
  border: 1px solid #ff5252;
  border-radius: 5px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.remove-btn i {
  font-size: 16px;
}

.remove-btn:hover {
  background: #ff5252;
  color: white;
}
</style>
