<template>
  <div class="flex">
    <span 
      v-for="i in 5" 
      :key="i" 
      class="text-xl"
      :class="i <= rating ? 'text-yellow-400' : 'text-gray-300'"
    >
      ★
    </span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  rating: {
    type: Number,
    required: true,
    default: 0,
    validator: (value) => value >= 0 && value <= 5
  },
  readonly: {
    type: Boolean,
    default: false
  }
});
</script> 