export const FALLBACK_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

export const handleImageError = (e) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_IMAGE;
};
