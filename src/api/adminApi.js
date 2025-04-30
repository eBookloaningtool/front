import axios from 'axios';

/**
 * 添加新书籍
 * @param {Object} bookData - 书籍数据
 * @returns {Promise<Object>} - 添加结果
 */
export const addNewBook = async (bookData) => {
  try {
    const response = await axios.post('/admin/books', bookData);
    return response.data;
  } catch (error) {
    console.error('添加书籍失败:', error);
    throw error;
  }
};

/**
 * 删除书籍
 * @param {string} bookId - 书籍ID
 * @returns {Promise<Object>} - 删除结果
 */
export const deleteBook = async (bookId) => {
  try {
    const response = await axios.delete(`/api/books/get?bookId=${bookId}`);
    return response.data;
  } catch (error) {
    console.error('删除书籍失败:', error);
    throw error;
  }
};

/**
 * 获取分类列表
 * @returns {Promise<Array>} - 分类列表
 */
export const getCategories = async () => {
  try {
    const response = await axios.get('/admin/categories');
    return response.data;
  } catch (error) {
    console.error('获取分类列表失败:', error);
    throw error;
  }
};

/**
 * 添加新分类
 * @param {Object} data - 分类数据，包含name和description
 * @returns {Promise<Object>} - 添加结果
 */
export const addCategory = async (data) => {
  try {
    const response = await axios.post('/admin/categories', data);
    return response.data;
  } catch (error) {
    console.error('添加分类失败:', error);
    throw error;
  }
};

/**
 * 更新分类信息
 * @param {string} id - 分类ID
 * @param {Object} data - 更新的分类数据
 * @returns {Promise<Object>} - 更新结果
 */
export const updateCategory = async (id, data) => {
  try {
    const response = await axios.put(`/admin/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('更新分类失败:', error);
    throw error;
  }
};

/**
 * 删除分类
 * @param {string} id - 分类ID
 * @returns {Promise<Object>} - 删除结果
 */
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('删除分类失败:', error);
    throw error;
  }
};

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.size - 每页数量
 * @param {string} params.search - 搜索关键词
 * @returns {Promise<Object>} - 用户列表和总数
 */
export const getUserList = async ({ page, size, search }) => {
  try {
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append('page', page);
    if (size !== undefined) queryParams.append('size', size);
    if (search) queryParams.append('search', search);
    
    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
}; 