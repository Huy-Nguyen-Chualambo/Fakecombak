import axios from 'axios';
import Cookies from 'js-cookie';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: 'http://localhost:8080', // Đã bỏ /api vì endpoint trong AuthController không có tiền tố này
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Quan trọng cho CORS với credentials
});

// Interceptor để thêm token vào header của mỗi request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      // Format chính xác là "Authorization: Bearer <token>"
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý các lỗi phản hồi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Xử lý lỗi 401 Unauthorized (token hết hạn, không hợp lệ, etc.)
      Cookies.remove('token', { path: '/' });
      localStorage.removeItem('user');
      window.location.href = '/'; // Chuyển hướng về trang đăng nhập
    }
    return Promise.reject(error);
  }
);

export default api;