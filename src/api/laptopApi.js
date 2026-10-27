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
  getById: async (id, signal) => {
    const res = await axiosClient.get(`/laptops/${id}`, {
      params: { _expand: ['brand', 'category'] },
      signal,
    });
    return res.data ?? res;
  },

  // Tạo mới laptop
  create: async (data) => {
    const res = await axiosClient.post('/laptops', data);
    return res.data ?? res;
  },

  // Cập nhật laptop (PUT)
  update: async (id, data) => {
    const res = await axiosClient.put(`/laptops/${id}`, data);
    return res.data ?? res;
  },

  // Cập nhật từng phần (PATCH - vd sửa tồn kho)
  patch: async (id, data) => {
    const res = await axiosClient.patch(`/laptops/${id}`, data);
    return res.data ?? res;
  },

  // Xóa laptop
  delete: async (id) => {
    const res = await axiosClient.delete(`/laptops/${id}`);
    return res.data ?? res;
  },
};

export default laptopApi;