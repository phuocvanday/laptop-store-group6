import axiosClient from './axiosClient';

const laptopApi = {
  // Lấy danh sách laptop kèm phân trang và tổng số lượng
  getAll: async (params, signal) => {
    const response = await axiosClient.get('/laptops', { params, signal });
    const total = Number(response.headers['x-total-count']) || 0;
    return {
      data: response.data,
      total,
    };
  },

  // Lấy chi tiết laptop kèm thông tin brand và category
  getById: (id, signal) => {
    return axiosClient.get(`/laptops/${id}`, {
      params: { _expand: ['brand', 'category'] },
      signal,
    });
  },

  // Tạo mới laptop
  create: (data) => {
    return axiosClient.post('/laptops', data);
  },

  // Cập nhật laptop (PUT)
  update: (id, data) => {
    return axiosClient.put(`/laptops/${id}`, data);
  },

  // Cập nhật từng phần (PATCH - vd sửa tồn kho)
  patch: (id, data) => {
    return axiosClient.patch(`/laptops/${id}`, data);
  },

  // Xóa laptop
  delete: (id) => {
    return axiosClient.delete(`/laptops/${id}`);
  },
};

export default laptopApi;