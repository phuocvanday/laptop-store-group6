/**
 * Trạng thái đơn hàng dùng chung giữa khách hàng (G4 - #27) và Admin (#30)
 */
export const ORDER_STATUS = {
  PENDING: 'pending',
  SHIPPING: 'shipping',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

export const ORDER_STATUS_MAP = {
  pending: {
    label: 'Chờ xử lý',
    variant: 'warning',
    next: ['shipping', 'cancelled'],
  },
  shipping: {
    label: 'Đang giao hàng',
    variant: 'info',
    next: ['done'],
  },
  done: {
    label: 'Hoàn thành',
    variant: 'success',
    next: [],
  },
  cancelled: {
    label: 'Đã hủy',
    variant: 'danger',
    next: [],
  },
};

export const getOrderStatusInfo = (status) => {
  return (
    ORDER_STATUS_MAP[status] || {
      label: status || 'Không xác định',
      variant: 'secondary',
      next: [],
    }
  );
};
