// mock-api.js
// 提供模拟数据用于开发和测试

// 模拟书籍数据
const mockBooks = [
  {
    id: 1,
    title: '三体',
    author: '刘慈欣',
    coverUrl: 'https://img3.doubanio.com/view/subject/l/public/s2565068s.jpg',
    description: '文化大革命期间，一次偶然的机会，军方进行了一次秘密的外星文明探索计划。',
    price: 59.8,
    categoryId: 1,
    isAvailable: true,
    publishDate: '2008-01-01',
    isbn: '9787536692930'
  },
  {
    id: 2,
    title: '活着',
    author: '余华',
    coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s29053580.jpg',
    description: '《活着》是余华的代表作，讲述了农村人福贵悲惨的人生遭遇。',
    price: 45.0,
    categoryId: 2,
    isAvailable: true,
    publishDate: '2012-08-01',
    isbn: '9787506365437'
  },
  {
    id: 3,
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    coverUrl: 'https://img2.doubanio.com/view/subject/l/public/s6384944.jpg',
    description: '《百年孤独》是魔幻现实主义文学的代表作，讲述了布恩迪亚家族七代人的传奇故事。',
    price: 55.0,
    categoryId: 2,
    isAvailable: true,
    publishDate: '2011-06-01',
    isbn: '9787544253994'
  },
  {
    id: 4,
    title: '围城',
    author: '钱钟书',
    coverUrl: 'https://img3.doubanio.com/view/subject/l/public/s1070222.jpg',
    description: '《围城》是中国现代文学史上的经典之作，描写了抗战时期知识分子的生活。',
    price: 39.0,
    categoryId: 2,
    isAvailable: false,
    publishDate: '1991-02-01',
    isbn: '9787020024759'
  },
  {
    id: 5,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s27814883.jpg',
    description: '《人类简史》从认知革命、农业革命到科学革命，看人类如何一步步走到今天。',
    price: 68.0,
    categoryId: 3,
    isAvailable: true,
    publishDate: '2014-11-01',
    isbn: '9787508647357'
  },
  {
    id: 6,
    title: '解忧杂货店',
    author: '东野圭吾',
    coverUrl: 'https://img2.doubanio.com/view/subject/l/public/s27264181.jpg',
    description: '《解忧杂货店》是东野圭吾的一部温暖治愈小说，讲述了三个小偷与一家杂货店的故事。',
    price: 39.5,
    categoryId: 1,
    isAvailable: true,
    publishDate: '2014-05-01',
    isbn: '9787544270878'
  },
  {
    id: 7,
    title: '平凡的世界',
    author: '路遥',
    coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s28435428.jpg',
    description: '《平凡的世界》是一部全景式地展现中国当代城乡生活的长篇小说。',
    price: 88.0,
    categoryId: 2,
    isAvailable: true,
    publishDate: '2017-06-01',
    isbn: '9787530216781'
  },
  {
    id: 8,
    title: '追风筝的人',
    author: '卡勒德·胡赛尼',
    coverUrl: 'https://img3.doubanio.com/view/subject/l/public/s1727290.jpg',
    description: '《追风筝的人》讲述了阿富汗富家少爷阿米尔与仆人哈桑的故事。',
    price: 29.0,
    categoryId: 2,
    isAvailable: true,
    publishDate: '2006-05-01',
    isbn: '9787208061644'
  },
  {
    id: 9,
    title: '小王子',
    author: '安托万·德·圣-埃克苏佩里',
    coverUrl: 'https://img2.doubanio.com/view/subject/l/public/s11031574.jpg',
    description: '《小王子》是一部写给成人的童话，讲述了来自外星球的小王子的故事。',
    price: 22.0,
    categoryId: 4,
    isAvailable: true,
    publishDate: '2003-08-01',
    isbn: '9787020042494'
  },
  {
    id: 10,
    title: '红楼梦',
    author: '曹雪芹',
    coverUrl: 'https://img1.doubanio.com/view/subject/l/public/s1070959.jpg',
    description: '《红楼梦》是中国古典四大名著之一，以贾、史、王、薛四大家族的兴衰为背景。',
    price: 59.7,
    categoryId: 2,
    isAvailable: true,
    publishDate: '1996-12-01',
    isbn: '9787020002207'
  }
];

// 模拟分类数据
const mockCategories = [
  { id: 1, name: '科幻小说', description: '科幻类书籍' },
  { id: 2, name: '文学小说', description: '文学类书籍' },
  { id: 3, name: '历史', description: '历史类书籍' },
  { id: 4, name: '儿童文学', description: '儿童文学类书籍' },
  { id: 5, name: '生活休闲', description: '生活休闲类书籍' },
  { id: 6, name: '经济管理', description: '经济管理类书籍' },
  { id: 7, name: '教育考试', description: '教育考试类书籍' },
  { id: 8, name: '艺术设计', description: '艺术设计类书籍' }
];

// 模拟用户数据
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    role: 'admin',
    name: '管理员',
    phone: '13800138000',
    address: '北京市海淀区'
  },
  {
    id: 2,
    username: 'user',
    password: 'user123',
    email: 'user@example.com',
    role: 'user',
    name: '测试用户',
    phone: '13900139000',
    address: '上海市浦东新区'
  }
];

// 模拟购物车数据
const mockCartItems = [
  {
    bookId: 1,
    quantity: 1,
    price: 59.8,
    title: '三体',
    author: '刘慈欣',
    coverUrl: 'https://img3.doubanio.com/view/subject/l/public/s2565068s.jpg'
  },
  {
    bookId: 3,
    quantity: 2,
    price: 55.0,
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    coverUrl: 'https://img2.doubanio.com/view/subject/l/public/s6384944.jpg'
  }
];

// 模拟愿望清单数据
const mockWishlist = {
  bookId: [2, 5, 8]
};

// 模拟借阅记录数据
const mockBorrowRecords = [
  {
    id: 1,
    bookId: 1,
    userId: 2,
    borrowDate: '2023-01-01',
    dueDate: '2023-02-01',
    returnDate: '2023-01-15',
    status: 'returned'
  },
  {
    id: 2,
    bookId: 3,
    userId: 2,
    borrowDate: '2023-03-01',
    dueDate: '2023-04-01',
    returnDate: null,
    status: 'borrowed'
  },
  {
    id: 3,
    bookId: 6,
    userId: 2,
    borrowDate: '2023-05-01',
    dueDate: '2023-06-01',
    returnDate: null,
    status: 'overdue'
  }
];

// 获取所有书籍
export const getMockBooks = () => {
  return mockBooks;
};

// 根据ID获取书籍
export const getMockBookById = (id) => {
  return mockBooks.find(book => book.id === id);
};

// 根据分类获取书籍
export const getMockBooksByCategory = (categoryId) => {
  if (typeof categoryId === 'string') {
    // 如果传入的是分类名称，先找到对应的分类ID
    const category = mockCategories.find(cat => cat.name === categoryId);
    if (category) {
      categoryId = category.id;
    } else {
      return [];
    }
  }
  return mockBooks.filter(book => book.categoryId === categoryId);
};

// 获取所有分类
export const getMockCategories = () => {
  return mockCategories;
};

// 根据ID获取分类
export const getMockCategoryById = (id) => {
  return mockCategories.find(category => category.id === id);
};

// 获取分类及其包含的书籍
export const getMockCategoriesWithBooks = () => {
  return mockCategories.map(category => {
    return {
      ...category,
      books: getMockBooksByCategory(category.id)
    };
  });
};

// 获取购物车数据
export const getMockCart = () => {
  return {
    items: mockCartItems,
    total: mockCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  };
};

// 获取愿望清单数据
export const getMockWishlist = () => {
  return mockWishlist;
};

// 获取借阅记录
export const getMockBorrowRecords = (userId) => {
  if (userId) {
    return mockBorrowRecords.filter(record => record.userId === userId);
  }
  return mockBorrowRecords;
};

// 模拟API响应
export const mockApiResponse = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        status: 200,
        message: 'success'
      });
    }, delay);
  });
};

// 默认导出
export default {
  getMockBooks,
  getMockBookById,
  getMockBooksByCategory,
  getMockCategories,
  getMockCategoryById,
  getMockCategoriesWithBooks,
  getMockCart,
  getMockWishlist,
  getMockBorrowRecords,
  mockApiResponse
}; 