import axios from 'axios';

// 获取愿望清单
export const getWishlist = async () => {
  try {
    const response = await axios.post('/api/wishlist/get');
    return response.data;
  } catch (error) {
    console.error('获取愿望清单失败:', error);
    throw error;
  }
};

// 获取书籍详情
export const getBookDetail = async (bookId: string) => {
  try {
    const response = await axios.get(`/api/books/get?bookId=${bookId}`);
    return response.data;
  } catch (error) {
    console.error('获取书籍详情失败:', error);
    throw error;
  }
};

// 从愿望清单中删除书籍
export const removeFromWishlist = async (bookId: string) => {
  try {
    const response = await axios.post('/api/wishlist/delete', { bookId });
    return response.data;
  } catch (error) {
    console.error('从愿望清单删除书籍失败:', error);
    throw error;
  }
}; 