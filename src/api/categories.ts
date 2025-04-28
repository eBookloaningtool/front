import axios, { AxiosError } from 'axios';

// --- TypeScript Interfaces ---

/**
 * 分类信息接口
 */
interface Category {
  name: string;
  description: string;
}

/**
 * 获取所有分类的响应接口
 */
interface GetAllCategoriesResponse {
  state: 'Success' | 'Error';
  categoriesList: Category[];
}

// --- API Functions ---

/**
 * 获取所有分类
 * @returns {Promise<GetAllCategoriesResponse>} - 所有分类信息
 */
export const getAllCategories = async (): Promise<GetAllCategoriesResponse> => {
  try {
    const response = await axios.get<GetAllCategoriesResponse>('/api/categories/getAll');
    return response.data;
  } catch (error) {
    console.error('获取所有分类失败:', error instanceof AxiosError ? error.message : error);
    // 返回符合接口的默认值
    return {
      state: 'Error',
      categoriesList: []
    };
  }
};