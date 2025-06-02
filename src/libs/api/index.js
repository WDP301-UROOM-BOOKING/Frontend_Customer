import axios from 'axios';
import qs from 'qs';
import { getToken } from '../../utils/handleToken'; // lấy từ localStorage

// 👉 Nếu dùng Vite: import.meta.env.VITE_API_URL
// 👉 Nếu dùng CRA: process.env.REACT_APP_API_URL
const axiosRequestConfig = {
  baseURL: process.env.REACT_APP_ENVIRONMENT === 'development' ? `${process.env.REACT_APP_BACKEND_CUSTOMER_URL_DEVELOPMENT}/api` : `${process.env.REACT_APP_BACKEND_CUSTOMER_URL_PRODUCT}/api`,
  responseType: 'json',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

const api = axios.create(axiosRequestConfig);

// Interceptor thêm token vào header
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken(); // từ localStorage
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default {
  async get(endPoint, options = {}) {
    let query = '';
    if (options.params) {
      query = qs.stringify(options.params, {
        addQueryPrefix: true,
        skipNulls: true,
      });
      delete options.params;
    }

    return api.request({
      url: `${endPoint}${query}`,
      ...options,
      method: 'GET',
    });
  },

  async post(endPoint, data, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};

    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    return api.request({
      url: endPoint,
      ...options,
      headers,
      method: 'POST',
      data,
    });
  },

  async put(endPoint, data, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }

    return api.request({
      url: endPoint,
      ...options,
      headers,
      method: 'PUT',
      data,
    });
  },

  async patch(endPoint, data, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};

    return api.request({
      url: endPoint,
      ...options,
      headers,
      method: 'PATCH',
      data,
    });
  },

  async delete(endPoint, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};

    return api.request({
      url: endPoint,
      ...options,
      headers,
      method: 'DELETE',
    });
  },
};
