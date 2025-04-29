<!-- SearchSection.vue -->
<template>
  <section class="search-section">
    <div class="search-container">
      <div class="search-input">
        <i class="ri-search-line"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by title, author or keywords" 
          @keyup.enter="handleSearch"
        />
        <i 
          v-show="searchQuery.length > 0" 
          class="ri-close-line clear-btn" 
          @click="clearSearch"
        ></i>
      </div>
      <button class="search-btn" @click="handleSearch">Search</button>
      <div class="advanced-search" @click="toggleAdvanced">
        Advanced Search <i :class="['ri-arrow-' + (showAdvanced ? 'up' : 'down') + '-s-line']"></i>
      </div>
    </div>
    
    <div class="advanced-options" v-if="showAdvanced">
      <div class="option-group">
        <label>Category</label>
        <select v-model="filters.category">
          <option value="">All Categories</option>
          <option value="novel">Fiction</option>
          <option value="technology">Technology</option>
          <option value="business">Business</option>
          <option value="biography">Biography</option>
          <option value="self-help">Self Help</option>
        </select>
      </div>
      
      <div class="option-group">
        <label>Rating</label>
        <select v-model="filters.rating">
          <option value="">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>
      
      <div class="option-group">
        <label>Published Date</label>
        <select v-model="filters.publishedDate">
          <option value="">All Time</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>
      </div>
      
      <button class="apply-filters-btn" @click="handleSearch">Apply Filters</button>
    </div>
    
    <div class="search-suggestions" v-if="showSuggestions">
      <ul>
        <li v-for="suggestion in searchSuggestions" :key="suggestion.id" @click="selectSuggestion(suggestion)">
          <i class="ri-book-line"></i>
          <span>{{ suggestion.title }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const showAdvanced = ref(false)
const showSuggestions = ref(false)
const filters = ref({
  category: '',
  rating: '',
  publishedDate: ''
})

// Mock search suggestions data
const searchSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  
  // In a real project, this would come from an API
  return [
    { id: 1, title: 'The Three-Body Problem' },
    { id: 2, title: 'Three Kingdoms' },
    { id: 3, title: 'Thirty Years to Life' }
  ].filter(item => item.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  // Build query parameters
  const queryParams = new URLSearchParams()
  queryParams.append('q', searchQuery.value)
  
  if (filters.value.category) {
    queryParams.append('category', filters.value.category)
  }
  
  if (filters.value.rating) {
    queryParams.append('rating', filters.value.rating)
  }
  
  if (filters.value.publishedDate) {
    queryParams.append('published', filters.value.publishedDate)
  }
  
  // Navigate to search results page
  router.push({
    path: '/search',
    query: Object.fromEntries(queryParams)
  })
  
  showSuggestions.value = false
}

const clearSearch = () => {
  searchQuery.value = ''
  showSuggestions.value = false
}

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion.title
  handleSearch()
}

// Listen for input to show or hide search suggestions
const handleInput = () => {
  showSuggestions.value = searchQuery.value.length >= 2 && searchSuggestions.value.length > 0
}

// Monitor search input with debounce
const debouncedInputHandler = () => {
  let timer = null
  return () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      handleInput()
    }, 300)
  }
}

const debouncedInput = debouncedInputHandler()
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
  max-width: 800px;
  margin: 0 auto;
}

.search-input {
  position: relative;
  flex-grow: 1;
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

.search-input .ri-search-line {
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
}

.search-btn:hover {
  background: #d89638;
}

.advanced-search {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  padding: 5px;
}

.advanced-search:hover {
  color: #e9a84c;
}

.advanced-options {
  margin-top: 20px;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.option-group label {
  font-size: 14px;
  color: #666;
}

.option-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  appearance: none;
  background: white url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6"><path d="M0 0l6 6 6-6z" fill="%23999"/></svg>') no-repeat right 12px center;
  padding-right: 30px;
}

.option-group select:focus {
  outline: none;
  border-color: #e9a84c;
}

.apply-filters-btn {
  padding: 8px 16px;
  background: #e9a84c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  align-self: flex-end;
  margin-left: auto;
}

.search-suggestions {
  position: absolute;
  top: calc(100% - 10px);
  left: 0;
  right: 0;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.search-suggestions ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-suggestions li {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-suggestions li:hover {
  background: #f5f5f5;
}

.search-suggestions i {
  color: #999;
}

@media (max-width: 768px) {
  .search-container {
    flex-wrap: wrap;
  }
  
  .search-input {
    order: 1;
    flex: 1 0 100%;
  }
  
  .search-btn {
    order: 2;
    flex: 1;
  }
  
  .advanced-search {
    order: 3;
    flex: 1;
    justify-content: center;
  }
}
</style> 