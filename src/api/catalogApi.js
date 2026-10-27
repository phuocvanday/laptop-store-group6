import axiosClient from './axiosClient';

const catalogApi = {
  getBrands: (signal) => axiosClient.get('/brands', { signal }),
  getCategories: (signal) => axiosClient.get('/categories', { signal }),
};

export default catalogApi;