import axios from 'axios';

/**
 * Add new book
 * @param {Object} bookData - Book data
 * @returns {Promise<Object>} - Add result
 */
export const addNewBook = async (bookData) => {
  try {
    const response = await axios.post('/admin/books', bookData);
    return response.data;
  } catch (error) {
    console.error('Add book failed:', error);
    throw error;
  }
};

/**
 * Delete book
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} - Delete result
 */
export const deleteBook = async (bookId) => {
  try {
    const response = await axios.delete(`/api/books/get?bookId=${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Delete book failed:', error);
    throw error;
  }
};

/**
 * Get category list
 * @returns {Promise<Array>} - Category list
 */
export const getCategories = async () => {
  try {
    const response = await axios.get('/admin/categories');
    return response.data;
  } catch (error) {
    console.error('Get category list failed:', error);
    throw error;
  }
};

/**
 * Add new category
 * @param {Object} data - Category data, containing name and description
 * @returns {Promise<Object>} - Add result
 */
export const addCategory = async (data) => {
  try {
    const response = await axios.post('/admin/categories', data);
    return response.data;
  } catch (error) {
    console.error('Add category failed:', error);
    throw error;
  }
};

/**
 * Update category information
 * @param {string} id - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise<Object>} - Update result
 */
export const updateCategory = async (id, data) => {
  try {
    const response = await axios.put(`/admin/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Update category failed:', error);
    throw error;
  }
};

/**
 * Delete category
 * @param {string} id - Category ID
 * @returns {Promise<Object>} - Delete result
 */
export const deleteCategory = async (id) => {
  try {
    const response = await axios.delete(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete category failed:', error);
    throw error;
  }
};

/**
 * Get user list
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.size - Number of items per page
 * @param {string} params.search - Search keyword
 * @returns {Promise<Object>} - User list and total count
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
    console.error('Get user list failed:', error);
    throw error;
  }
};
