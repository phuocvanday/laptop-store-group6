import axiosClient from './axiosClient';

const reviewApi = {
  // Lấy danh sách review theo laptopId kèm user
  getByLaptopId: (laptopId, signal) => {
    return axiosClient.get('/reviews', {
      params: { laptopId, _expand: 'user', _sort: 'createdAt', _order: 'desc' },
      signal,
    });
  },

  // Thêm đánh giá mới
  create: (data) => {
    return axiosClient.post('/reviews', data);
  },
};

export default reviewApi;