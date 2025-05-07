const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 启用CORS
app.use(cors());

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 加载数据
let books = [];
let categorizedBooks = [];

try {
  const booksData = fs.readFileSync(path.join(__dirname, 'public', 'books.json'), 'utf8');
  const categorizedData = fs.readFileSync(path.join(__dirname, 'public', 'categorized_books.json'), 'utf8');
  books = JSON.parse(booksData);
  categorizedBooks = JSON.parse(categorizedData);
  console.log(`加载了 ${books.length} 本书和 ${categorizedBooks.length} 个分类`);
} catch (error) {
  console.error('加载数据文件时出错:', error);
}

// API路由
// 获取热门书籍
app.get('/api/books/popular', (req, res) => {
  const category = req.query.category;
  let result = books;

  if (category) {
    result = books.filter(book => book.category === category);
  }

  res.json({
    bookId: result.map(book => book.bookId)
  });
});

// 获取书籍详情
app.get('/api/books/get', (req, res) => {
  const bookId = req.query.bookId;
  const book = books.find(b => b.bookId === bookId);

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: '未找到书籍' });
  }
});

// 搜索书籍
app.get('/api/books/search', (req, res) => {
  const query = req.query.q || '';
  if (!query) {
    return res.json({ code: 200, data: [] });
  }

  const results = books.filter(book =>
    book.title.toLowerCase().includes(query.toLowerCase()) ||
    book.author.toLowerCase().includes(query.toLowerCase()) ||
    book.description.toLowerCase().includes(query.toLowerCase())
  );

  res.json({ code: 200, data: results });
});

// 获取分类列表
app.get('/api/categories', (req, res) => {
  res.json(categorizedBooks.map(cat => ({
    id: cat.category_id,
    name: cat.category_name,
    description: cat.description
  })));
});

// 获取分类书籍
app.get('/api/categories/:id/books', (req, res) => {
  const categoryId = req.params.id;
  const category = categorizedBooks.find(cat => cat.category_id === categoryId);

  if (category) {
    res.json(category.books);
  } else {
    res.status(404).json({ error: '未找到分类' });
  }
});

// 封面图片代理
app.get('/api/cover-proxy', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) {
    return res.status(400).json({ error: 'Missing image URL parameter' });
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const contentType = response.headers['content-type'];

    res.set('Content-Type', contentType);
    res.send(response.data);
  } catch (error) {
    console.error('获取封面图片失败:', error.message);
    res.status(500).json({ error: 'Failed to obtain cover image' });
  }
});

// 处理前端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 借阅相关API
app.post('/api/borrow/borrow', (req, res) => {
  const { bookId, userId } = req.body;

  res.json({
    state: 'success',
    dueDate: '2023-12-31',
    balance: 100,
    message: 'Borrowing successful'
  });
});

// 购物车相关API
app.post('/api/cart/add', (req, res) => {
  const { bookId, userId } = req.body;

  res.json({
    state: 'success',
    message: 'Successfully added to cart'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`JSON数据API: http://localhost:${PORT}/api/books/popular`);
  console.log(`封面代理: http://localhost:${PORT}/api/cover-proxy?url=图片URL`);
});
