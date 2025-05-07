<template>
  <div>
    <input
      v-model="query"
      placeholder="Please enter the book name or author keyword"
      @input="searchLocalBooks"
    />
    <ul>
      <li v-for="book in searchResults" :key="book.id">
        {{ book.title }} — {{ book.author }}
      </li>
      <li v-if="searchResults.length === 0">No matching books</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      allBooks: [],     // 扁平化后的所有书籍
      query: '',        // 搜索框双向绑定
      searchResults: [] // 搜索结果
    };
  },
  methods: {
    searchLocalBooks() {
      const q = this.query.trim().toLowerCase();
      if (!q) {
        this.searchResults = [];
        return;
      }
      
      this.searchResults = this.allBooks.filter(book => 
        book.title.toLowerCase().includes(q) || 
        book.author.toLowerCase().includes(q)
      );
    },
    
    flattenBookData(categorizedBooks) {
      // 将分类数据扁平化为单一书籍数组
      let books = [];
      categorizedBooks.forEach(category => {
        if (category.books && Array.isArray(category.books)) {
          // 为每本书添加分类信息
          const booksWithCategory = category.books.map(book => ({
            ...book,
            category: category.category_name
          }));
          books = books.concat(booksWithCategory);
        }
      });
      return books;
    }
  },
  mounted() {
    fetch('/categorized_books.json')
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => {
        this.allBooks = this.flattenBookData(data); 
      })
      .catch(err => console.error('加载书籍数据失败:', err));
  }
};
</script> 