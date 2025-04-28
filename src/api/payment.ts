/**
 * 支付相关接口
 */

// 引入请求方法
import { post } from '../utils/request.ts';

// 接口定义
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

// 接口地址枚举
const URL = {
  TOPUP: '/api/payments/topup',
  PAYMENT_HISTORY: '/api/payments/history'
};

/**
 * 充值余额
 * @param {number} amount - 充值金额
 * @returns {Promise<TopUpSuccessResponse>} - 响应结果，包含状态和余额信息
 */
export async function topUp(amount: number): Promise<TopUpSuccessResponse> {
  return post({
    url: URL.TOPUP,
    data: { amount }
  });
}

/**
 * 获取充值历史记录
 * @returns {Promise<PaymentHistoryResponse>} - 充值历史记录列表
 */
export async function getPaymentHistory(): Promise<PaymentHistoryResponse> {
  return post({
    url: URL.PAYMENT_HISTORY,
    data: {}
  });
} 