<!-- SearchSection.vue -->
<template>
  <section class="search-section">
    <div class="search-container">
      <div class="search-input">
        <i class="ri-book-line"></i>
        <input
          type="text"
          v-model="searchTitle"
          placeholder="Search book title"
          @keyup.enter="handleSearch"
        />
        <i
          v-show="searchTitle.length > 0"
          class="ri-close-line clear-btn"
          @click="clearTitle"
        ></i>
      </div>
      <div class="search-input">
        <i class="ri-user-line"></i>
        <input
          type="text"
          v-model="searchAuthor"
          placeholder="Search author"
          @keyup.enter="handleSearch"
        />
        <i
          v-show="searchAuthor.length > 0"
          class="ri-close-line clear-btn"
          @click="clearAuthor"
        ></i>
      </div>
      <div class="search-input">
        <i class="ri-folder-line"></i>
        <input
          type="text"
          v-model="searchCategory"
          placeholder="Search category"
          @keyup.enter="handleSearch"
        />
        <i
          v-show="searchCategory.length > 0"
          class="ri-close-line clear-btn"
          @click="clearCategory"
        ></i>
      </div>
      <button class="search-btn" @click="handleSearch">Search</button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchTitle = ref('')
const searchAuthor = ref('')
const searchCategory = ref('')

const handleSearch = () => {
  // At least one search condition is required
  if (!searchTitle.value.trim() && !searchAuthor.value.trim() && !searchCategory.value.trim()) return

  // Build query parameters
  const queryParams = {}

  if (searchTitle.value.trim()) {
    queryParams.title = searchTitle.value.trim()
  }

  if (searchAuthor.value.trim()) {
    queryParams.author = searchAuthor.value.trim()
  }

  if (searchCategory.value.trim()) {
    queryParams.category = searchCategory.value.trim()
  }

  // Navigate to search results page
  router.push({
    path: '/search',
    query: queryParams
  })
}

const clearTitle = () => {
  searchTitle.value = ''
}

const clearAuthor = () => {
  searchAuthor.value = ''
}

const clearCategory = () => {
  searchCategory.value = ''
}
</script>

<style scoped>
.search-section {
  position: relative;
  padding: 30px 0;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-input {
  position: relative;
  flex: 1;
}

.search-input input {
  width: 100%;
  padding: 12px 40px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.search-input input:focus {
  outline: none;
  border-color: #e9a84c;
}

.search-input i {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input .ri-book-line,
.search-input .ri-user-line,
.search-input .ri-folder-line {
  left: 15px;
}

.clear-btn {
  right: 15px;
  cursor: pointer;
}

.search-btn {
  padding: 12px 24px;
  background: #e9a84c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
}

.search-btn:hover {
  background: #d89638;
}

@media (max-width: 768px) {
  .search-container {
    flex-wrap: wrap;
  }

  .search-input {
    flex: 1 0 100%;
  }

  .search-btn {
    flex: 1;
  }
}
</style>
