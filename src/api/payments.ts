import axios from 'axios';

// 获取支付历史记录
export const getPaymentHistory = async () => {
  try {
    const response = await axios.post('/api/payments/history');
    return response.data;
  } catch (error) {
    console.error('获取支付历史记录失败:', error);
    throw error;
  }
}; 