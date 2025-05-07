<template>
  <div class="book-cover-wrapper">
    <img
      v-if="!hasError"
      :src="imgSrc"
      :alt="alt"
      class="book-cover-img"
      @error="handleImageError"
    />
    <div v-else class="default-cover-placeholder">
      <span>No cover</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: 'Book cover'
  },
  fallback: {
    type: String,
    default: 'https://source.unsplash.com/collection/1320303/300x450?sig=fallback'
  }
})

const imgSrc = ref(props.src)
const hasError = ref(false)

// 监听 src 变化，动态更新图片
watch(() => props.src, (newSrc) => {
  imgSrc.value = newSrc
  hasError.value = false
})

// 图片加载失败时处理
const handleImageError = () => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Failed to load cover image: ${imgSrc.value}, using default cover`)
  }
  imgSrc.value = props.fallback
  hasError.value = true
}
</script>

<style scoped>
.book-cover-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 6px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.default-cover-placeholder {
  width: 100%;
  height: 100%;
  background-color: #eee;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
</style>
