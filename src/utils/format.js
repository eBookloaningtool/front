// Format price to GBP format
export const formatPrice = (price) => {
    return `£${parseFloat(price).toFixed(2)}`;
  };
