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

// 充值余额
export const topUpBalance = async (amount: number) => {
  try {
    const response = await axios.post('/api/payments/topup', { amount });
    return response.data;
  } catch (error) {
    console.error('充值失败:', error);
    throw error;
  }
}; 