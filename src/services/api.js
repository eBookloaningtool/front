import axios from 'axios';

// 用户相关API
export const userAPI = {
  // 用户注册
  register: (data) => axios.post('/api/users/register', data),
  
  // 用户登录
  login: (data) => axios.post('/api/auth/login', data),
  
  // 用户登出
  logout: () => axios.post('/api/auth/logout'),
  
  // 获取用户信息
  getUserInfo: () => axios.post('/api/users/info'),
  
  // 更新用户信息
  updateUserInfo: (data) => axios.post('/api/users/update', data),
  
  // 删除账号
  deleteAccount: () => axios.post('/api/users/delete'),
  
  // 忘记密码
  forgetPassword: (data) => axios.post('/api/auth/forget', data)
};

// 书籍相关API
export const bookAPI = {
  // 获取热门书籍榜单
  getPopularBooks: () => {
    return axios.get('/api/books/popular');
  },

  // 获取书籍详情
  getBookDetail: (bookId) => {
    return axios.get(`/api/books/get?bookId=${bookId}`);
  },

  // 获取书籍内容
  getBookContent: (bookId) => {
    return axios.post('/api/books/content', { bookId });
  },

  // 搜索书籍
  searchBooks: (params) => {
    const { title, author, category } = params;
    const queryParams = new URLSearchParams();
    if (title) queryParams.append('title', title);
    if (author) queryParams.append('author', author);
    if (category) queryParams.append('category', category);
    return axios.get(`/api/books/search?${queryParams.toString()}`);
  },

  // 获取所有书籍
  getAllBooks: () => {
    return axios.get('/api/books/popular');
  },

  // 获取分类书籍
  getBooksByCategory: (categoryId) => {
    return axios.get(`/api/books?categoryId=${categoryId}`);
  }
};

// 分类相关API
export const categoryAPI = {
  // 获取所有分类
  getAllCategories: () => axios.get('/api/categories/getAll'),
  
  // 获取分类详情
  getCategoryDetail: (categoryId) => axios.get(`/api/categories/${categoryId}`),
  
  // 获取带书籍的分类
  getCategoriesWithBooks: () => axios.get('/api/categories/getAll')
};

// 借阅相关API
export const borrowAPI = {
  // 借阅书籍
  borrowBooks: (bookIds) => axios.post('/api/borrow', { bookIds }),
  
  // 归还书籍
  returnBook: (bookId) => axios.post(`/api/borrow/${bookId}/return`),
  
  // 续借
  renewBook: (bookId) => axios.post(`/api/borrow/${bookId}/renew`),
  
  // 获取借阅列表
  getBorrowList: () => axios.get('/api/borrow'),
  
  // 获取借阅历史
  getBorrowHistory: () => axios.get('/api/borrow/history')
};

// 愿望清单相关API
export const wishlistAPI = {
  // 添加到愿望清单
  addToWishlist: (bookId) => axios.post('/api/wishlist', { bookId }),
  
  // 从愿望清单移除
  removeFromWishlist: (bookId) => axios.delete(`/api/wishlist/${bookId}`),
  
  // 获取愿望清单
  getWishlist: () => axios.get('/api/wishlist')
};

// 购物车相关API
export const cartAPI = {
  // 添加到购物车
  addToCart: (bookId) => axios.post('/api/cart/add', { bookId }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  
  // 从购物车移除
  removeFromCart: (bookId) => axios.post('/api/cart/remove', { bookId: Array.isArray(bookId) ? bookId : [bookId] }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  
  // 更新购物车商品数量
  updateCartItem: (bookId, quantity) => axios.put(`/api/cart/${bookId}`, { quantity }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }),
  
  // 获取购物车
  getCart: () => axios.post('/api/cart/get', {}, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
};

// 评论相关API
export const reviewAPI = {
  // 添加评论
  addReview: (data) => axios.post('/api/reviews', data),
  
  // 获取用户评论
  getUserReviews: () => axios.get('/api/reviews/user'),
  
  // 获取书籍评论
  getBookReviews: (bookId) => axios.get(`/api/reviews/book/${bookId}`),
  
  // 获取评论详情
  getReviewDetail: (reviewId) => axios.get(`/api/reviews/${reviewId}`),
  
  // 删除评论
  deleteReview: (reviewId) => axios.delete(`/api/reviews/${reviewId}`)
};

// 支付相关API
export const paymentAPI = {
  // 创建支付订单
  createOrder: (data) => axios.post('/api/payments/orders', data),
  
  // 获取订单详情
  getOrderDetail: (orderId) => axios.get(`/api/payments/orders/${orderId}`),
  
  // 支付订单
  payOrder: (orderId, data) => axios.post(`/api/payments/orders/${orderId}/pay`, data),
  
  // 获取支付历史
  getPaymentHistory: () => axios.get('/api/payments/history')
}; 