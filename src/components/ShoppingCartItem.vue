<!-- ShoppingCartItem.vue -->
<template>
  <div class="cart-item">
    <img :src="item.coverUrl" :alt="item.title" class="book-cover" />
    <div class="item-details">
      <h3>{{ item.title }}</h3>
      <p class="author">{{ item.author }}</p>
      <p class="price">￡{{ item.price }}</p>
    </div>
    <button class="remove-btn" @click="$emit('remove', item.bookId)">Remove</button>
  </div>
</template>

<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:quantity', 'remove']);

const updateQuantity = (newQuantity) => {
  if (newQuantity >= 1) {
    emit('update:quantity', props.item.bookId, newQuantity);
  }
};
</script>

<style scoped>
.cart-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  gap: 1rem;
}

.book-cover {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.author {
  color: #666;
  margin: 0 0 0.5rem 0;
}

.price {
  font-weight: bold;
  color: #e53935;
  margin: 0 0 0.5rem 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-controls button {
  padding: 0.25rem 0.5rem;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
}

.quantity-controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background: #ffebee;
  color: #e53935;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.remove-btn:hover {
  background: #ffcdd2;
}
</style>
