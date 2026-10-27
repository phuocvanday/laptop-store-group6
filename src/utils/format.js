/**
 * Định dạng số tiền sang định dạng tiền tệ Việt Nam (VND).
 * Ví dụ: 39990000 -> "39.990.000 ₫"
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

/**
 * Định dạng chuỗi ngày tháng ISO sang DD/MM/YYYY.
 * Ví dụ: "2026-09-10T10:00:00Z" -> "10/09/2026"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Lấy giá bán thực tế của sản phẩm (nếu có salePrice thì lấy salePrice, không thì lấy price).
 */
export const getFinalPrice = (laptop) => {
  if (!laptop) return 0;
  return laptop.salePrice ? laptop.salePrice : laptop.price;
};

export const getSellingPrice = getFinalPrice;

/**
 * Tính phần trăm giảm giá giữa price và salePrice.
 * Ví dụ: price 20tr, salePrice 18tr -> giảm 10%
 */
export const calculateDiscount = (price, salePrice) => {
  if (!price || !salePrice || price <= salePrice) return 0;
  return Math.round(((price - salePrice) / price) * 100);
};