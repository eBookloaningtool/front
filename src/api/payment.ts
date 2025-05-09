/**
 * Payment related interfaces
 */

// Import request method
import { post } from '../utils/request.ts';

// Interface definition
interface TopUpSuccessResponse {
  state: string;
  paymentId: string;
  balance: number;
}

interface PaymentHistoryItem {
  paymentId: string;
  date: string;
  amount: number;
}

interface PaymentHistoryResponse {
  state: string;
  data: PaymentHistoryItem[];
}

// Interface address enumeration
const URL = {
  TOPUP: '/api/payments/topup',
  PAYMENT_HISTORY: '/api/payments/history'
};

/**
 * Top up balance
 * @param {number} amount - Top up amount
 * @returns {Promise<TopUpSuccessResponse>} - Response result, including status and balance information
 */
export async function topUp(amount: number): Promise<TopUpSuccessResponse> {
  return post({
    url: URL.TOPUP,
    data: { amount }
  });
}

/**
 * Get top up history
 * @returns {Promise<PaymentHistoryResponse>} - Top up history list
 */
export async function getPaymentHistory(): Promise<PaymentHistoryResponse> {
  return post({
    url: URL.PAYMENT_HISTORY,
    data: {}
  });
}
