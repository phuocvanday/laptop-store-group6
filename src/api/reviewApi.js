import axiosClient from './axiosClient';

const reviewApi = {
  // Lấy danh sách review theo laptopId kèm user
  getByLaptopId: async (laptopId, signal) => {
    const res = await axiosClient.get('/reviews', {
      params: { laptopId, _expand: 'user', _sort: 'createdAt', _order: 'desc' },
      signal,
    });
    return res.data ?? res;
  },

  // Thêm đánh giá mới
  create: async (data) => {
    const res = await axiosClient.post('/reviews', data);
    return res.data ?? res;
  },
};

export default reviewApi;