import axios, { AxiosError } from 'axios';

// --- TypeScript interfaces ---

/**
 * Category information interface
 */
interface Category {
  name: string;
  description: string;
}

/**
 * Get all categories response interface
 */
interface GetAllCategoriesResponse {
  state: 'Success' | 'Error';
  categoriesList: Category[];
}

// --- API Functions ---

/**
 * Get all categories
 * @returns {Promise<GetAllCategoriesResponse>} - All category information
 */
export const getAllCategories = async (): Promise<GetAllCategoriesResponse> => {
  try {
    const response = await axios.get<GetAllCategoriesResponse>('/api/categories/getAll');
    return response.data;
  } catch (error) {
    console.error('Failed to get all categories:', error instanceof AxiosError ? error.message : error);
    // Return default values that match the interface
    return {
      state: 'Error',
      categoriesList: []
    };
  }
};
