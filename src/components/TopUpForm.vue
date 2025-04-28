<script setup>
import { ref, reactive } from 'vue';
// 引入支付API
import { topUp } from '../api/payment.ts';

// 表单数据
const amount = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isSubmitting = ref(false);
const topUpSuccess = ref(false);
const newBalance = ref(0);

// 字段状态管理
const fieldStatus = reactive({
  amount: {
    focused: false,
    valid: true
  }
});

// 设置字段焦点状态
const setFieldFocus = (field, status) => {
  fieldStatus[field].focused = status;
};

// 表单验证
const validateForm = () => {
  let isValid = true;

  if (!amount.value) {
    fieldStatus.amount.valid = false;
    errorMessage.value = '请输入充值金额';
    isValid = false;
  } else if (isNaN(amount.value) || parseInt(amount.value) <= 0) {
    fieldStatus.amount.valid = false;
    errorMessage.value = '请输入有效的充值金额';
    isValid = false;
  } else {
    fieldStatus.amount.valid = true;
  }

  return isValid;
};

// 实时验证单个字段
const validateField = () => {
  if (amount.value) {
    fieldStatus.amount.valid = !isNaN(amount.value) && parseInt(amount.value) > 0;
  }
};

// 处理充值
const handleTopUp = async () => {
  try {
    // 重置消息
    errorMessage.value = '';
    successMessage.value = '';

    // 表单验证
    if (!validateForm()) {
      return;
    }

    isSubmitting.value = true;

    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (!token) {
      errorMessage.value = '请先登录';
      isSubmitting.value = false;
      return;
    }

    // 使用封装的API方法发送充值请求
    const data = await topUp(parseInt(amount.value));

    if (data.state === 'success') {
      // 显示成功状态
      topUpSuccess.value = true;
      newBalance.value = data.balance;
      successMessage.value = `充值成功！您的余额现在是 ${data.balance} 元`;

      // 清空输入框
      amount.value = '';
    } else {
      // 处理充值失败
      errorMessage.value = data.message || '充值失败，请稍后重试';
    }
  } catch (error) {
    console.error('充值错误:', error);
    errorMessage.value = '充值过程中发生错误，请稍后重试';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="top-up-form-container p-8 bg-white rounded-xl shadow-lg border border-gray-100">
    <h2 class="text-2xl font-bold mb-6 text-center text-indigo-800">账户充值</h2>

    <!-- 充值成功消息 -->
    <div v-if="successMessage" class="success-message mb-6">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-center text-gray-800 mt-4">充值成功！</h3>
      <p class="text-center text-gray-600 mt-2">{{ successMessage }}</p>
      <div class="balance-display mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <p class="text-center text-2xl font-bold text-indigo-700">{{ newBalance }} 元</p>
        <p class="text-center text-sm text-indigo-500">账户余额</p>
      </div>
    </div>

    <form @submit.prevent="handleTopUp" class="space-y-5">
      <!-- 错误消息显示 -->
      <div v-if="errorMessage" class="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md mb-4 transition-all duration-300" role="alert">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm">{{ errorMessage }}</p>
          </div>
        </div>
      </div>

      <!-- 金额输入 -->
      <div class="form-group">
        <label for="amount" class="block text-sm font-medium mb-1" :class="[
          fieldStatus.amount.focused ? 'text-indigo-600' : 'text-gray-700',
          !fieldStatus.amount.valid ? 'text-red-600' : ''
        ]">充值金额</label>
        <div class="relative rounded-md shadow-sm">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500">£</span>
          </span>
          <input
            id="amount"
            v-model="amount"
            type="number"
            min="1"
            class="w-full pl-10 pr-4 py-3 border rounded-lg transition-colors"
            :class="[
              fieldStatus.amount.focused ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300',
              !fieldStatus.amount.valid ? 'border-red-500 ring-2 ring-red-200' : ''
            ]"
            placeholder="请输入充值金额"
            required
            @focus="setFieldFocus('amount', true)"
            @blur="setFieldFocus('amount', false); validateField()"
            @input="validateField()"
          />
          <div v-if="!fieldStatus.amount.valid" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-500">请输入您想要充值的金额（元）</p>
      </div>

      <!-- 充值按钮 -->
      <button
        type="submit"
        class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300 mt-6 transform hover:scale-105 active:scale-95"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          充值中...
        </span>
        <span v-else>立即充值</span>
      </button>
    </form>
  </div>
</template>

<style scoped>
.top-up-form-container {
  animation: fadeIn 0.5s ease-out;
  transition: all 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-message {
  animation: bounceIn 0.6s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.balance-display {
  animation: pulseGlow 2s infinite alternate;
}

@keyframes pulseGlow {
  from {
    box-shadow: 0 0 2px rgba(99, 102, 241, 0.1);
  }
  to {
    box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
  }
}
</style>
