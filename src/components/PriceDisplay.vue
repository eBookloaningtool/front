<template>
    <span class="price">{{ formattedPrice }}</span>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { formatPrice } from '@/utils/format';
  
  const props = defineProps({
    price: Number
  });
  
  const formattedPrice = computed(() => formatPrice(props.price));
  </script>