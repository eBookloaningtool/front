<!-- CategoriesSection.vue -->
<template>
  <section class="categories-section">
    <h2 class="section-title">Popular Categories</h2>
    <div class="categories-container">
      <div 
        v-for="category in categories" 
        :key="category.id" 
        class="category-card"
        @click="navigateToCategory(category)"
      >
        <div class="category-icon">
          <i :class="category.icon"></i>
        </div>
        <h3 class="category-name">{{ category.name }}</h3>
        <p class="category-count">{{ category.count }} books</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([
  {
    id: 'novel',
    name: 'Fiction',
    icon: 'ri-book-3-line',
    count: 1254,
    color: '#e9a84c'
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: 'ri-lightbulb-line',
    count: 857,
    color: '#4c9be9'
  },
  {
    id: 'business',
    name: 'Business',
    icon: 'ri-line-chart-line',
    count: 653,
    color: '#4ce97b'
  },
  {
    id: 'biography',
    name: 'Biography',
    icon: 'ri-user-star-line',
    count: 427,
    color: '#e94c9b'
  },
  {
    id: 'history',
    name: 'History',
    icon: 'ri-global-line',
    count: 531,
    color: '#9b4ce9'
  },
  {
    id: 'selfhelp',
    name: 'Self Help',
    icon: 'ri-seedling-line',
    count: 389,
    color: '#e94c4c'
  }
])

const navigateToCategory = (category) => {
  router.push({
    path: '/categories/' + category.id
  })
}
</script>

<style scoped>
.categories-section {
  margin: 40px 0;
}

.section-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 24px;
  padding-bottom: 10px;
  border-bottom: 2px solid #eee;
}

.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.category-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fffbf0;
}

.category-icon i {
  font-size: 30px;
  color: #e9a84c;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.category-count {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .categories-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .categories-container {
    grid-template-columns: 1fr;
  }
}
</style> 