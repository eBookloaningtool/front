<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from '../composables/useToast';

const router = useRouter();
const { showToast } = useToast();

// Preset top-up amounts
const presetAmounts = [50, 100, 200, 500, 1000];
const selectedAmount = ref(null);
const customAmount = ref('');
const isProcessing = ref(false);
const currentBalance = ref(0); // Should get from API in production

// Calculate final amount
const finalAmount = computed(() => {
  return selectedAmount.value || Number(customAmount.value) || 0;
});

// Validate amount
const isValidAmount = computed(() => {
  return finalAmount.value > 0 && finalAmount.value <= 10000;
});

// Select preset amount
const selectAmount = (amount) => {
  selectedAmount.value = amount;
  customAmount.value = '';
};

// Handle custom amount input
const handleCustomAmount = () => {
  selectedAmount.value = null;
  // Limit maximum amount to 10000
  if (Number(customAmount.value) > 10000) {
    customAmount.value = '10000';
  }
};

// Handle top up
const handleTopUp = async () => {
  if (!isValidAmount.value || isProcessing.value) return;

  isProcessing.value = true;

  try {
    // Mock payment response
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
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
      showToast(`Top up successful! £${finalAmount.value} has been added to your account.`, 'success');
      currentBalance.value += finalAmount.value;
      localStorage.setItem('accountBalance', currentBalance.value); // Persist
      selectedAmount.value = null;
      customAmount.value = '';
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      throw new Error(result.paymetSuccess.reason || 'Payment failed');
    }
  } catch (error) {
    console.error('Top up failed:', error);
    showToast(error.message || 'Top up failed, please try again', 'error');
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  const savedBalance = localStorage.getItem('accountBalance');
  currentBalance.value = savedBalance ? Number(savedBalance) : 0;
});
</script>

<template>
  <div class="topup-container">
    <div class="topup-card">
      <h1 class="page-title">Account Top Up</h1>

      <!-- Current balance display -->
      <div class="balance-display">
        <i class="ri-wallet-3-line"></i>
        <span>Current Balance: £{{ currentBalance }}</span>
      </div>

      <!-- Top up amount options -->
      <div class="amount-options">
        <h3>Select Amount</h3>
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

      <!-- Custom amount input -->
      <div class="custom-amount">
        <h3>Custom Amount</h3>
        <div class="input-group">
          <span class="currency-symbol">£</span>
          <input
            type="number"
            v-model="customAmount"
            placeholder="Enter amount"
            @input="handleCustomAmount"
            min="1"
            step="1"
          />
        </div>
      </div>

      <!-- Confirm button -->
      <button
        class="confirm-btn"
        :disabled="!isValidAmount || isProcessing"
        @click="handleTopUp"
      >
        <i v-if="isProcessing" class="ri-loader-4-line loading-icon"></i>
        <span v-else>Confirm Top Up</span>
      </button>

      <!-- Information -->
      <div class="topup-info">
        <i class="ri-information-line"></i>
        <p>The amount will be credited instantly to your account and can be used for book rentals.</p>
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
.custom-amount {
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
}
</style>
