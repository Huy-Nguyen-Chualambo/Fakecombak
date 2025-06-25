import api from './api';
import Cookies from 'js-cookie';

// Định nghĩa kiểu dữ liệu cho request và response
export interface LoginRequest {
  email: string;
  password: string;
  twoFactorAuth?: {
    enabled: boolean;
  };
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  mobile?: string;
}

export interface AuthResponse {
  jwt: string;         // Cập nhật theo API response của backend
  status: boolean;
  message: string;
  isTwoFactorEnabled?: boolean;
  session?: string;
}

export interface UserInfo {
  id?: number;
  fullName: string;
  email: string;
  role?: string;
  mobile?: string;
  twoFactorAuth?: {
    enabled: boolean;
    verificationMethod?: string;
  };
}

// Thời gian sống của cookie token (7 ngày)
const TOKEN_EXPIRY_DAYS = 7;

// Helper function to safely check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

// Service xử lý đăng nhập/đăng ký
const authService = {
  // Đăng nhập
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // Thêm trường twoFactorAuth theo yêu cầu của API
    const loginData = {
      ...data,
      twoFactorAuth: {
        enabled: false  // Mặc định disable two-factor auth khi đăng nhập
      }
    };
    const response = await api.post<AuthResponse>('/auth/signin', loginData);
    return response.data;
  },

  // Đăng ký
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  // Lấy thông tin người dùng từ backend
  fetchUserProfile: async (jwt: string): Promise<UserInfo> => {
    try {
      const response = await api.get('/api/users/profile', {
        headers: {
          Authorization: jwt
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Trả về thông tin mặc định nếu có lỗi
      return {
        fullName: 'Khách hàng',
        email: '',
        role: 'USER'
      };
    }
  },

  // Lưu thông tin đăng nhập
  saveAuth: async (data: AuthResponse): Promise<void> => {
    // Lưu token vào cookie để middleware có thể truy cập
    if (data.jwt) {
      Cookies.set('token', data.jwt, { expires: TOKEN_EXPIRY_DAYS, path: '/' });
      
      try {
        // Lấy thông tin người dùng từ API
        const userInfo = await authService.fetchUserProfile(data.jwt);
        
        // Check if we're in a browser environment before using localStorage
        if (isBrowser()) {
          localStorage.setItem('user', JSON.stringify(userInfo));
        }
      } catch (error) {
        // Nếu không lấy được thông tin, sử dụng giá trị mặc định
        const defaultUserInfo = {
          fullName: 'Khách hàng',
          email: '',
          role: 'USER'
        };
        
        // Check if we're in a browser environment before using localStorage
        if (isBrowser()) {
          localStorage.setItem('user', JSON.stringify(defaultUserInfo));
        }
      }
    }
  },

  // Đăng xuất
  logout: (): void => {
    // Xóa token khỏi cookie
    Cookies.remove('token', { path: '/' });
    
    // Xóa thông tin user khỏi localStorage
    if (isBrowser()) {
      localStorage.removeItem('user');
      
      // Chuyển hướng về trang đăng nhập
      window.location.href = '/';
    }
  },

  // Lấy thông tin user đã đăng nhập
  getCurrentUser: () => {
    if (isBrowser()) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    }
    return null;
  },

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn: (): boolean => {
    return !!Cookies.get('token');
  },
  
  // Lấy token
  getToken: (): string | undefined => {
    return Cookies.get('token');
  }
};

export default authService;