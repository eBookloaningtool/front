/**
 * Image utility functions
 */

// Get book cover URL
export const getBookCoverUrl = (bookId) => {
  return `/images/book-covers/book${bookId}.jpg`;
};

// Image loading error handling
export const handleImageError = (event) => {
  event.target.src = '/images/default-book-cover.html';
  // Add default styles to make the placeholder look better
  event.target.style.backgroundColor = '#e0e0e0';
  event.target.style.display = 'flex';
  event.target.style.justifyContent = 'center';
  event.target.style.alignItems = 'center';
  event.target.style.color = '#666';
  event.target.style.fontSize = '12px';
};

// Batch preload images
export const preloadImages = (imageUrls) => {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = resolve;
        img.onerror = resolve; // Even if loading fails, continue
      });
    })
  );
};
