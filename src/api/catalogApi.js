import axiosClient from './axiosClient';

const catalogApi = {
  getBrands: async (signal) => {
    const res = await axiosClient.get('/brands', { signal });
    return res.data ?? res;
  },
  getCategories: async (signal) => {
    const res = await axiosClient.get('/categories', { signal });
    return res.data ?? res;
  },
};

export default catalogApi;