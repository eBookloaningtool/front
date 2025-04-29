<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '../composables/useToast';

const router = useRouter();
const { showToast } = useToast();

// 预设充值金额
const presetAmounts = [50, 100, 200, 500, 1000];
const selectedAmount = ref(null);
const customAmount = ref('');
const isProcessing = ref(false);
const currentBalance = ref(0); // 这里应该从API获取当前余额

// 支付方式
const paymentMethods = [
  { id: 'card', name: '银行卡', icon: 'ri-bank-card-line' }
];
const selectedPayment = ref('card');

// 银行卡信息
const cardInfo = ref({
  cardNumber: '',
  cardHolder: '',
  expiryDate: '',
  cvv: ''
});

// 表单验证
const isCardValid = computed(() => {
  return cardInfo.value.cardNumber.length === 16 &&
         cardInfo.value.cardHolder.trim() !== '' &&
         cardInfo.value.expiryDate.length === 5 &&
         cardInfo.value.cvv.length === 3;
});

// 计算最终充值金额
const finalAmount = computed(() => {
  return selectedAmount.value || Number(customAmount.value) || 0;
});

// 验证金额是否有效
const isValidAmount = computed(() => {
  return finalAmount.value > 0 && finalAmount.value <= 10000;
});

// 选择预设金额
const selectAmount = (amount) => {
  selectedAmount.value = amount;
  customAmount.value = '';
};

// 处理自定义金额输入
const handleCustomAmount = () => {
  selectedAmount.value = null;
  // 限制最大金额为10000
  if (Number(customAmount.value) > 10000) {
    customAmount.value = '10000';
  }
};

// 选择支付方式
const selectPayment = (methodId) => {
  selectedPayment.value = methodId;
};

// 处理充值
const handleTopUp = async () => {
  if (!isValidAmount.value || isProcessing.value || !isCardValid.value) return;

  isProcessing.value = true;

  try {
    // mock HorsePay 返回
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    const result = {
      storeID: "Team01",
      customerID: "C6678345",
      date: "10/06/2021",
      time: "10:55",
      timeZone: "GMT",
      transactionAmount: finalAmount.value,
      currencyCode: "GBP",
      paymetSuccess: {
        Status: true,
        reason: "payment successful"
      }
    };

    if (result.paymetSuccess.Status) {
      showToast(`充值成功！已充值 £${finalAmount.value}`, 'success');
      currentBalance.value += finalAmount.value;
      localStorage.setItem('accountBalance', currentBalance.value); // 持久化
      selectedAmount.value = null;
      customAmount.value = '';
      cardInfo.value = {
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
      };
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      throw new Error(result.paymetSuccess.reason || '支付失败');
    }
  } catch (error) {
    console.error('充值失败:', error);
    showToast(error.message || '充值失败，请重试', 'error');
  } finally {
    isProcessing.value = false;
  }
};

// 格式化卡号输入
const formatCardNumber = (value) => {
  return value.replace(/\D/g, '').slice(0, 16);
};

// 格式化过期日期输入
const formatExpiryDate = (value) => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};

// 格式化CVV输入
const formatCVV = (value) => {
  return value.replace(/\D/g, '').slice(0, 3);
};

onMounted(() => {
  const savedBalance = localStorage.getItem('accountBalance');
  currentBalance.value = savedBalance ? Number(savedBalance) : 0;
});
</script>

<template>
  <div class="topup-container">
    <div class="topup-card">
      <h1 class="page-title">账户充值</h1>

      <!-- 当前余额显示 -->
      <div class="balance-display">
        <i class="ri-wallet-3-line"></i>
        <span>当前余额: £{{ currentBalance }}</span>
      </div>

      <!-- 充值金额选项 -->
      <div class="amount-options">
        <h3>选择充值金额</h3>
        <div class="amount-grid">
          <button
            v-for="amount in presetAmounts"
            :key="amount"
            :class="['amount-btn', { 'selected': selectedAmount === amount }]"
            @click="selectAmount(amount)"
          >
            £{{ amount }}
          </button>
        </div>
      </div>

      <!-- 自定义金额输入 -->
      <div class="custom-amount">
        <h3>自定义金额</h3>
        <div class="input-group">
          <span class="currency-symbol">£</span>
          <input
            type="number"
            v-model="customAmount"
            placeholder="请输入充值金额"
            @input="handleCustomAmount"
            min="1"
            step="1"
          />
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="payment-methods">
        <h3>选择支付方式</h3>
        <div class="payment-options">
          <div
            v-for="method in paymentMethods"
            :key="method.id"
            :class="['payment-option', { 'selected': selectedPayment === method.id }]"
            @click="selectPayment(method.id)"
          >
            <i :class="method.icon"></i>
            <span>{{ method.name }}</span>
          </div>
        </div>
      </div>

      <!-- 银行卡支付表单 -->
      <div class="card-payment-form" v-if="selectedPayment === 'card'">
        <div class="form-group">
          <label>卡号</label>
          <input
            type="text"
            v-model="cardInfo.cardNumber"
            @input="e => cardInfo.cardNumber = formatCardNumber(e.target.value)"
            placeholder="请输入16位卡号"
            maxlength="16"
          />
        </div>

        <div class="form-group">
          <label>持卡人姓名</label>
          <input
            type="text"
            v-model="cardInfo.cardHolder"
            placeholder="请输入持卡人姓名"
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>有效期</label>
            <input
              type="text"
              v-model="cardInfo.expiryDate"
              @input="e => cardInfo.expiryDate = formatExpiryDate(e.target.value)"
              placeholder="MM/YY"
              maxlength="5"
            />
          </div>

          <div class="form-group">
            <label>CVV</label>
            <input
              type="text"
              v-model="cardInfo.cvv"
              @input="e => cardInfo.cvv = formatCVV(e.target.value)"
              placeholder="CVV"
              maxlength="3"
            />
          </div>
        </div>
      </div>

      <!-- 确认充值按钮 -->
      <button
        class="confirm-btn"
        :disabled="!isValidAmount || isProcessing || !isCardValid"
        @click="handleTopUp"
      >
        <i v-if="isProcessing" class="ri-loader-4-line loading-icon"></i>
        <span v-else>确认充值</span>
      </button>

      <!-- 充值说明 -->
      <div class="topup-info">
        <i class="ri-information-line"></i>
        <p>充值金额将立即到账，可用于借阅书籍</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topup-container {
  min-height: 100vh;
  padding: 20px;
  padding-top: 80px;
  background: #f5f5f5;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.topup-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}

.page-title {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.balance-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 30px;
  font-size: 18px;
  color: #666;
}

.balance-display i {
  font-size: 24px;
  color: #e9a84c;
}

.amount-options,
.custom-amount,
.payment-methods {
  margin-bottom: 30px;
}

h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.amount-btn {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.amount-btn:hover {
  border-color: #e9a84c;
  transform: translateY(-2px);
}

.amount-btn.selected {
  background: #e9a84c;
  border-color: #e9a84c;
  color: white;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-symbol {
  position: absolute;
  left: 15px;
  color: #666;
  font-size: 18px;
}

input[type="number"] {
  width: 100%;
  padding: 12px 15px 12px 35px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

input[type="number"]:focus {
  border-color: #e9a84c;
  outline: none;
}

.payment-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option:hover {
  border-color: #e9a84c;
  transform: translateY(-2px);
}

.payment-option.selected {
  background: #f8f9fa;
  border-color: #e9a84c;
}

.payment-option i {
  font-size: 24px;
  color: #666;
}

.confirm-btn {
  width: 100%;
  padding: 15px;
  background: #e9a84c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.confirm-btn:hover:not(:disabled) {
  background: #d89638;
  transform: translateY(-2px);
}

.confirm-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.topup-info {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  font-size: 14px;
}

.topup-info i {
  color: #e9a84c;
}

.card-payment-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #666;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #e9a84c;
  outline: none;
  box-shadow: 0 0 0 2px rgba(233, 168, 76, 0.1);
}

input::placeholder {
  color: #999;
}

@media (max-width: 480px) {
  .topup-card {
    padding: 20px;
  }

  .amount-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .payment-options {
    grid-template-columns: 1fr;
  }
}
</style>
