import axios from 'axios';

// Get payment history
export const getPaymentHistory = async () => {
  try {
    const response = await axios.post('/api/payments/history');
    return response.data;
  } catch (error) {
    console.error('Failed to get payment history:', error);
    throw error;
  }
};

// Top up balance
export const topUpBalance = async (amount: number) => {
  try {
    const response = await axios.post('/api/payments/topup', { amount });
    return response.data;
  } catch (error) {
    console.error('Failed to top up balance:', error);
    throw error;
  }
};
