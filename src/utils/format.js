// 格式化价格为英镑格式
export const formatPrice = (price) => {
    return `£${parseFloat(price).toFixed(2)}`;
  };