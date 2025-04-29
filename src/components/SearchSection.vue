<!-- SearchSection.vue -->
<template>
  <section class="search-section">
    <div class="search-container">
      <div class="search-input">
        <i class="ri-search-line"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="搜索书名、作者或关键词" 
          @keyup.enter="handleSearch"
        />
        <i 
          v-show="searchQuery.length > 0" 
          class="ri-close-line clear-btn" 
          @click="clearSearch"
        ></i>
      </div>
      <button class="search-btn" @click="handleSearch">搜索</button>
      <div class="advanced-search" @click="toggleAdvanced">
        高级搜索 <i :class="['ri-arrow-' + (showAdvanced ? 'up' : 'down') + '-s-line']"></i>
      </div>
    </div>
    
    <div class="advanced-options" v-if="showAdvanced">
      <div class="option-group">
        <label>作者</label>
        <input 
          type="text" 
          v-model="filters.author" 
          placeholder="输入作者名称"
          @keyup.enter="handleSearch"
        />
      </div>
      
      <div class="option-group">
        <label>分类</label>
        <select v-model="filters.category">
          <option value="">全部分类</option>
          <option 
            v-for="category in categories" 
            :key="category.name" 
            :value="category.name"
          >
            {{ category.name }}
          </option>
        </select>
      </div>
      
      <button class="apply-filters-btn" @click="handleSearch">应用筛选</button>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const searchQuery = ref('')
const showAdvanced = ref(false)
const showSuggestions = ref(false)
const categories = ref([])
const filters = ref({
  author: '',
  category: ''
})

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/categories/getAll')
    if (response.data.state === 'Success') {
      categories.value = response.data.categoriesList
    } else {
      console.error('获取分类列表失败:', response.data)
    }
  } catch (error) {
    console.error('获取分类列表出错:', error)
  }
}

// Mock search suggestions data
const searchSuggestions = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) return []
  
  // In a real project, this would come from an API
  return [
    { id: 1, title: '三体' },
    { id: 2, title: '三国演义' },
    { id: 3, title: '活着' }
  ].filter(item => item.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const handleSearch = () => {
  if (!searchQuery.value.trim() && !filters.value.author.trim() && !filters.value.category) return
  
  // 构建查询参数
  const queryParams = new URLSearchParams()
  
  // 如果主搜索框有内容，作为标题搜索
  if (searchQuery.value.trim()) {
    queryParams.append('title', searchQuery.value.trim())
  }
  
  // 添加作者搜索条件
  if (filters.value.author.trim()) {
    queryParams.append('author', filters.value.author.trim())
  }
  
  // 添加分类搜索条件
  if (filters.value.category) {
    queryParams.append('category', filters.value.category)
  }
  
  // 导航到搜索结果页面
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

// 组件挂载时获取分类列表
onMounted(() => {
  fetchCategories()
})
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

.option-group input,
.option-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.option-group input:focus,
.option-group select:focus {
  outline: none;
  border-color: #e9a84c;
}

.option-group select {
  appearance: none;
  background: white url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="6"><path d="M0 0l6 6 6-6z" fill="%23999"/></svg>') no-repeat right 12px center;
  padding-right: 30px;
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