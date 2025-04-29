// 模拟API服务
// 从本地JSON文件加载数据
import axios from 'axios';

// 存储模拟数据
let mockData = {
  wishlist: {}, // 用户ID -> 书籍ID数组的映射
  balance: {}, // 用户ID -> 余额的映射
  users: {}, // 存储用户信息：email -> {password, UUID}
  books: [], // 书籍数据将从JSON文件加载
  categories: [], // 分类数据将从JSON文件加载
  borrowedBooks: {}, // 用户ID -> 借阅记录数组的映射
  cart: {}, // 用户ID -> 购物车数组的映射
  bookBorrowCount: {} // 书籍ID -> 借阅次数的映射
};

// 在mock初始化阶段加载JSON数据
(async function loadMockData() {
  try {
    // 加载books.json
    const booksResponse = await fetch('/public/books.json');
    if (booksResponse.ok) {
      mockData.books = await booksResponse.json();
      console.log('[Mock] 成功加载书籍数据:', mockData.books.length, '本书');
    } else {
      console.error('[Mock] 加载books.json失败:', booksResponse.status);
      // 加载失败时使用默认数据
      loadDefaultBooks();
    }

    // 加载categorized_books.json
    const categorizedResponse = await fetch('/public/categorized_books.json');
    if (categorizedResponse.ok) {
      const categorizedBooks = await categorizedResponse.json();
      mockData.categories = categorizedBooks.map(category => ({
        id: category.category_id,
        name: category.category_name,
        description: category.description
      }));
      console.log('[Mock] 成功加载分类数据:', mockData.categories.length, '个分类');
    } else {
      console.error('[Mock] 加载categorized_books.json失败:', categorizedResponse.status);
      // 使用默认分类
      loadDefaultCategories();
    }
  } catch (error) {
    console.error('[Mock] 加载JSON数据时出错:', error);
    // 加载失败时使用默认数据
    loadDefaultBooks();
    loadDefaultCategories();
  }
})();

// 加载默认书籍数据（如果JSON文件加载失败）
function loadDefaultBooks() {
  console.log('[Mock] 使用默认书籍数据');
  mockData.books = [
    {
      bookId: "book123",
      title: "JavaScript高级编程",
      author: "张三",
      publisher: "编程出版社",
      isbn: "978-1234567890",
      description: "这是一本JavaScript入门到精通的学习指南。",
      coverUrl: "https://via.placeholder.com/150x200",
      category: "科技",
      availableCopies: 5,
      totalCopies: 10,
      price: 59.9
    },
    // 其他默认书籍...
  ];
}

// 加载默认分类数据（如果JSON文件加载失败）
function loadDefaultCategories() {
  console.log('[Mock] 使用默认分类数据');
  mockData.categories = [
    {
      id: "latest",
      name: "最新发布的书",
      description: "近期上架的新书"
    },
    {
      id: "科技",
      name: "科技",
      description: "科技相关书籍"
    },
    // 其他默认分类...
  ];
}

// 将mockData暴露到全局，方便调试和在组件中访问
if (typeof window !== 'undefined') {
  window.mockData = mockData;
}

const mockAPI = {
  post: async (url, data, headers = {}) => {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 处理注册请求
        if (url === '/api/auth/register') {
          const { email, password, name } = data;

          // 检查邮箱是否已被注册
          if (mockData.users[email]) {
            resolve({
              state: 'error',
              message: 'Email already registered'
            });
            return;
          }

          // 生成UUID
          const UUID = 'user_' + Math.random().toString(36).substr(2, 9);

          // 存储用户信息
          mockData.users[email] = {
            password,
            name,
            UUID
          };

          // 生成令牌
          const token = 'token_' + Math.random().toString(36).substr(2, 16);

          // 在控制台输出调试信息
          console.log('用户注册成功:', email, UUID);
          console.log('当前注册用户列表:', Object.keys(mockData.users));

          resolve({
            state: 'success',
            message: 'Registration successful',
            token,
            UUID
          });
        }
        // 处理登录请求
        else if (url === '/api/auth/login') {
          const { email, password } = data;

          // 检查用户是否存在
          if (!mockData.users[email]) {
            resolve({
              state: 'error',
              message: 'User not found'
            });
            return;
          }

          // 验证密码
          if (mockData.users[email].password !== password) {
            resolve({
              state: 'error',
              message: 'Invalid password'
            });
            return;
          }

          // 验证通过，生成令牌
          const token = 'token_' + Math.random().toString(36).substr(2, 16);

          resolve({
            state: 'success',
            message: 'Login successful',
            token,
            UUID: mockData.users[email].UUID
          });
        }
        // 处理忘记密码请求
        else if (url === '/api/auth/forget') {
          const { email } = data;

          // 检查用户是否存在
          if (!mockData.users[email]) {
            resolve({
              state: 'error',
              message: '此邮箱未注册'
            });
            return;
          }

          // 生成随机密码
          const generateRandomPassword = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let password = '';
            for (let i = 0; i < 10; i++) {
              password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
          };

          const newPassword = generateRandomPassword();

          // 更新用户密码
          mockData.users[email].password = newPassword;

          // 模拟发送邮件
          console.log(`发送密码重置邮件到 ${email}，新密码: ${newPassword}`);

          // 导入邮件服务
          try {
            // 实际项目中，这部分应该由后端处理
            // 这里仅作为模拟，实际使用时请改为真实的后端API调用
            const { sendEmailNotification } = require('./utils/emailService.js');

            sendEmailNotification('password_reset', {
              user: {
                email: email,
                name: mockData.users[email].name || '用户'
              },
              newPassword: newPassword
            }).catch(err => console.error('发送密码重置邮件失败:', err));
          } catch (error) {
            console.error('邮件服务调用失败:', error);
          }

          resolve({
            state: 'success',
            message: '密码重置邮件已发送'
          });
        }
        // 处理密码修改请求
        else if (url === '/api/user/change-password') {
          const userId = getUserId();
          if (!userId) {
            resolve({
              state: 'error',
              message: '未登录或会话已过期'
            });
            return;
          }

          const { currentPassword, newPassword, email } = data;

          // 检查用户是否存在
          if (!mockData.users[email]) {
            resolve({
              state: 'error',
              message: '用户不存在'
            });
            return;
          }

          // 验证当前密码
          if (mockData.users[email].password !== currentPassword) {
            resolve({
              state: 'error',
              message: '当前密码不正确'
            });
            return;
          }

          // 更新密码
          mockData.users[email].password = newPassword;

          console.log(`用户 ${email} 的密码已更新`);

          resolve({
            state: 'success',
            message: '密码修改成功'
          });
        }

        // 从Authorization头解析用户ID
        const getUserId = () => {
          const token = headers.Authorization?.split(' ')[1];
          // 如果token存在，返回模拟用户ID；否则返回null
          if (!token) {
            console.log('[Mock] 缺少认证令牌，无法识别用户');
            return null;
          }

          console.log('[Mock] 用户已认证，使用模拟用户ID');
          // 模拟从token中提取用户ID
          // 在真实情况下，这应该是解析JWT token
          return '3a0e3d23-5061-4602-a814-2bbc4447347e';
        };

        // 模拟充值接口
        if (url === '/api/payments/topup') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          if (!mockData.balance[userId]) {
            mockData.balance[userId] = 0;
          }

          const amount = data.amount;
          if (isNaN(amount) || amount <= 0) {
            resolve({ state: 'error', message: '无效的充值金额' });
            return;
          }

          mockData.balance[userId] += parseInt(amount);

          resolve({
            state: 'success',
            balance: mockData.balance[userId]
          });
        }

        // 模拟愿望清单添加接口
        if (url === '/api/wishlist/add') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          if (!mockData.wishlist[userId]) {
            mockData.wishlist[userId] = [];
          }

          const bookId = data.bookId;
          if (!mockData.wishlist[userId].includes(bookId)) {
            mockData.wishlist[userId].push(bookId);
          }

          resolve({ state: 'success' });
        }

        // 模拟愿望清单删除接口
        if (url === '/api/wishlist/delete') {
          const userId = getUserId();
          if (!userId || !mockData.wishlist[userId]) {
            resolve({ state: 'error', message: '未登录或愿望清单为空' });
            return;
          }

          const bookIds = Array.isArray(data.bookId) ? data.bookId : [data.bookId];
          mockData.wishlist[userId] = mockData.wishlist[userId].filter(
            id => !bookIds.includes(id)
          );

          resolve({ state: 'success' });
        }

        // 模拟获取愿望清单接口
        if (url === '/api/wishlist/get') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          resolve({
            state: 'success',
            bookId: mockData.wishlist[userId] || []
          });
        }

        // 模拟借阅书籍接口
        if (url === '/api/borrow/borrow') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          // 支持批量借阅，确保 bookId 是数组
          const bookIdArray = Array.isArray(data.bookId) ? data.bookId : [data.bookId];

          // 跟踪各种错误情况的书籍ID
          const invalidBookIds = [];
          const lowStockBookIds = [];
          const borrowedBookIds = [];
          const successfulBookIds = [];

          // 计算总的借阅费用
          let totalBorrowFee = 0;

          // 检查每本书是否可借阅
          for (const bookId of bookIdArray) {
            // 查找书籍，支持id和bookId两种格式
            const book = mockData.books.find(b =>
              String(b.bookId) === String(bookId) || String(b.id) === String(bookId)
            );

            // 如果书籍不存在
            if (!book) {
              console.log(`[Mock] 无效的书籍ID: ${bookId}`);
              invalidBookIds.push(bookId);
              continue;
            }

            const actualBookId = book.bookId || book.id;

            // 初始化借阅计数
            if (!mockData.bookBorrowCount[actualBookId]) {
              mockData.bookBorrowCount[actualBookId] = 0;
            }

            // 检查是否已达到借阅上限(10次)
            if (mockData.bookBorrowCount[actualBookId] >= 10) {
              lowStockBookIds.push(actualBookId);
              continue;
            }

            // 检查用户是否已借阅过该书
            if (mockData.borrowedBooks[userId] &&
                mockData.borrowedBooks[userId].some(record =>
                  record.bookId === actualBookId || String(record.bookId) === String(actualBookId)
                )) {
              borrowedBookIds.push(actualBookId);
              continue;
            }

            // 累加借阅费用
            totalBorrowFee += 5; // 固定每本书5元

            // 标记为可成功借阅
            successfulBookIds.push(actualBookId);
          }

          // 检查是否没有任何可借阅的书籍
          if (successfulBookIds.length === 0) {
            const response = {
              state: 'Borrow failed.',
            };

            if (invalidBookIds.length > 0) response.InvalidBookIds = invalidBookIds;
            if (lowStockBookIds.length > 0) response.LowStockBookIds = lowStockBookIds;
            if (borrowedBookIds.length > 0) response.BorrowedBookIds = borrowedBookIds;

            console.log('[Mock] 借阅失败:', response);
            resolve(response);
            return;
          }

          // 检查用户余额是否足够
          if (!mockData.balance[userId]) {
            mockData.balance[userId] = 0;
          }

          // 检查余额是否足够
          if (mockData.balance[userId] < totalBorrowFee) {
            resolve({
              state: 'insufficient balance',
              newPayment: totalBorrowFee
            });
            return;
          }

          // 扣除余额
          mockData.balance[userId] -= totalBorrowFee;

          // 初始化用户的借阅记录
          if (!mockData.borrowedBooks[userId]) {
            mockData.borrowedBooks[userId] = [];
          }

          // 设置到期日期（当前日期 + 30天）
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 30);
          const formattedDueDate = dueDate.toISOString().split('T')[0];

          // 为成功借阅的书籍添加借阅记录
          for (const bookId of successfulBookIds) {
            // 增加该书的借阅计数
            mockData.bookBorrowCount[bookId]++;

            // 添加借阅记录
            mockData.borrowedBooks[userId].push({
              bookId,
              borrowDate: new Date().toISOString().split('T')[0],
              dueDate: formattedDueDate
            });

            console.log(`[Mock] 用户 ${userId} 借阅了书籍 ${bookId}，到期日期: ${formattedDueDate}`);
          }

          // 返回结果，包括部分失败情况
          const response = {
            state: 'success',
            dueDate: formattedDueDate,
            balance: mockData.balance[userId],
          };

          // 如果有失败的书籍，添加到响应中
          if (invalidBookIds.length > 0 || lowStockBookIds.length > 0 || borrowedBookIds.length > 0) {
            if (invalidBookIds.length > 0) response.InvalidBookIds = invalidBookIds;
            if (lowStockBookIds.length > 0) response.LowStockBookIds = lowStockBookIds;
            if (borrowedBookIds.length > 0) response.BorrowedBookIds = borrowedBookIds;
          }

          console.log('[Mock] 借阅成功: ', response);
          resolve(response);
        }

        // 模拟归还书籍接口
        if (url === '/api/borrow/return') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          const bookId = data.bookId;

          // 检查用户是否借阅了该书
          if (!mockData.borrowedBooks[userId] ||
              !mockData.borrowedBooks[userId].some(record => record.bookId === bookId)) {
            resolve({ state: 'error', message: '您未借阅该书籍' });
            return;
          }

          // 减少该书的借阅计数
          if (mockData.bookBorrowCount[bookId]) {
            mockData.bookBorrowCount[bookId] = Math.max(0, mockData.bookBorrowCount[bookId] - 1);
          }

          // 移除借阅记录
          mockData.borrowedBooks[userId] = mockData.borrowedBooks[userId]
            .filter(record => record.bookId !== bookId);

          resolve({
            state: 'success',
            message: '归还成功'
          });
        }

        // 模拟续借书籍接口
        if (url === '/api/borrow/renew') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          const bookId = data.bookId;

          // 检查用户是否借阅了该书
          if (!mockData.borrowedBooks[userId]) {
            resolve({ state: 'error', message: '您未借阅任何书籍' });
            return;
          }

          const borrowRecord = mockData.borrowedBooks[userId]
            .find(record => record.bookId === bookId);

          if (!borrowRecord) {
            resolve({ state: 'error', message: '您未借阅该书籍' });
            return;
          }

          // 获取书籍信息以获取续借费用
          const book = mockData.books.find(b => b.bookId === bookId);
          const renewFee = book ? book.price : 5; // 默认5元

          // 检查用户余额是否足够
          if (!mockData.balance[userId]) {
            mockData.balance[userId] = 0;
          }

          if (mockData.balance[userId] < renewFee) {
            resolve({
              state: 'insufficient balance',
              newPayment: renewFee
            });
            return;
          }

          // 扣除续借费用
          mockData.balance[userId] -= renewFee;

          // 设置新的到期日期（当前到期日期 + 30天）
          const currentDueDate = new Date(borrowRecord.dueDate);
          currentDueDate.setDate(currentDueDate.getDate() + 30);
          const newDueDate = currentDueDate.toISOString().split('T')[0];

          // 更新借阅记录
          borrowRecord.dueDate = newDueDate;

          resolve({
            state: 'success',
            newDueDate: newDueDate,
            balance: mockData.balance[userId],
            message: '续借成功'
          });
        }

        // 模拟添加到购物车接口
        if (url === '/api/cart/add') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          if (!mockData.cart[userId]) {
            mockData.cart[userId] = [];
          }

          const bookId = data.bookId;

          // 检查书籍是否存在
          const book = mockData.books.find(b => String(b.bookId) === String(bookId) || String(b.id) === String(bookId));
          if (!book) {
            resolve({ state: 'error', message: '书籍不存在' });
            return;
          }

          // 检查是否已在购物车中
          if (!mockData.cart[userId].includes(bookId)) {
            mockData.cart[userId].push(bookId);
            console.log(`[Mock] 用户 ${userId} 添加书籍 ${bookId} 到购物车`);
          }

          resolve({ state: 'success', message: '成功添加到购物车' });
          return;
        }

        // 模拟获取购物车内容接口
        if (url === '/api/cart/get') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          resolve({
            state: 'success',
            bookId: mockData.cart[userId] || []
          });
          return;
        }

        // 模拟从购物车移除接口
        if (url === '/api/cart/remove') {
          const userId = getUserId();
          if (!userId || !mockData.cart[userId]) {
            resolve({ state: 'error', message: '未登录或购物车为空' });
            return;
          }

          const bookIds = Array.isArray(data.bookId) ? data.bookId : [data.bookId];
          mockData.cart[userId] = mockData.cart[userId].filter(
            id => !bookIds.includes(id)
          );

          resolve({ state: 'success', message: '成功从购物车移除' });
          return;
        }

        // 模拟清空购物车接口
        if (url === '/api/cart/clear') {
          const userId = getUserId();
          if (!userId) {
            resolve({ state: 'error', message: '未登录' });
            return;
          }

          mockData.cart[userId] = [];

          resolve({ state: 'success', message: '购物车已清空' });
          return;
        }
      }, 500); // 500ms延迟模拟网络请求
    });
  },

  get: async (url) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟获取热门书籍
        if (url.startsWith('/api/books/popular')) {
          const categoryParam = new URL(url, 'http://dummy.com').searchParams.get('category');
          let bookIds = mockData.books.map(book => book.bookId);

          // 按分类筛选
          if (categoryParam) {
            const filteredBooks = mockData.books.filter(book =>
              book.category.toLowerCase() === categoryParam.toLowerCase()
            );
            bookIds = filteredBooks.map(book => book.bookId);
          }

          resolve({
            bookId: bookIds
          });
          return;
        }

        // 模拟获取书籍详情
        if (url.match(/\/api\/books\/[a-zA-Z0-9]+$/)) {
          const bookId = url.split('/').pop();
          const book = mockData.books.find(b => b.bookId === bookId);

          if (book) {
            resolve(book);
          } else {
            resolve(null);
          }
          return;
        }

        // 模拟搜索书籍
        if (url.startsWith('/api/books/search')) {
          const query = new URL(url, 'http://dummy.com').searchParams.get('q');

          if (!query) {
            resolve({
              code: 200,
              data: []
            });
            return;
          }

          const results = mockData.books.filter(book =>
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.description.toLowerCase().includes(query.toLowerCase())
          );

          resolve({
            code: 200,
            data: results
          });
          return;
        }
      }, 800);
    });
  }
};

// 添加愿望清单模拟功能
export const mockWishlistAPI = {
  wishlist: ['book123', 'book456', 'book789'], // 添加一些初始测试数据

  // 添加到愿望清单
  addToWishlist(bookId) {
    if (!this.wishlist.includes(bookId)) {
      this.wishlist.push(bookId);
    }
    return { state: 'success' };
  },

  // 从愿望清单中移除
  removeFromWishlist(bookIds) {
    if (Array.isArray(bookIds)) {
      this.wishlist = this.wishlist.filter(id => !bookIds.includes(id));
    }
    return { state: 'success' };
  },

  // 获取愿望清单
  getWishlist() {
    return { bookId: [...this.wishlist] };
  }
};

// 获取所有图书分类
export function getMockCategories() {
  return mockData.categories;
}

// 根据分类ID获取该分类下的所有图书
export function getMockBooksByCategory(categoryId) {
  // 如果是"最新发布的书"，返回按ID倒序排列的前10本书
  if (categoryId === 'latest') {
    return getMockBooks()
      .sort((a, b) => b.bookId.localeCompare(a.bookId))
      .slice(0, 10);
  }

  // 否则按分类筛选
  return getMockBooks().filter(book => book.category === categoryId);
}

// 获取所有带书籍的分类
export function getMockCategoriesWithBooks() {
  return mockData.categories.map(category => {
    const books = getMockBooksByCategory(category.id);
    return {
      category_id: category.id,
      category_name: category.name,
      description: category.description,
      books: books
    };
  });
}

// 获取所有模拟书籍
export function getMockBooks() {
  return mockData.books.map(book => ({
    ...book,
    id: book.bookId, // 确保ID字段统一
    cover: book.coverUrl, // 确保cover字段存在
    price: 5 // 统一设置价格为5元
  }));
}

// 根据ID获取特定模拟书籍
export function getMockBook(id) {
  const foundBook = mockData.books.find(book =>
    String(book.bookId) === String(id)
  );

  if (foundBook) {
    return {
      ...foundBook,
      id: foundBook.bookId, // 确保ID字段统一
      cover: foundBook.coverUrl, // 确保cover字段存在
      price: 5 // 统一设置价格为5元
    };
  }

  return null;
}

export default mockAPI;
