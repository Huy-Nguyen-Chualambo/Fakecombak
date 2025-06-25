'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';
import Logo from './Logo';

type AuthFormProps = {
  mode: 'login' | 'register';
};

const AuthForm = ({ mode }: AuthFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    
    // Clear API error when typing
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
      isValid = false;
    }
    
    // Additional validations for register mode
    if (mode === 'register') {
      if (!formData.fullName) {
        newErrors.fullName = 'Họ tên là bắt buộc';
        isValid = false;
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
        isValid = false;
      } else if (formData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setApiError('');
      
      try {
        if (mode === 'login') {
          // Đăng nhập
          const response = await authService.login({
            email: formData.email,
            password: formData.password
          });
          
          // Xử lý two-factor auth nếu được bật
          if (response.isTwoFactorEnabled) {
            // Giả sử UI sẽ xử lý two-factor auth sau (không triển khai trong ví dụ này)
            console.log('Two-factor auth is enabled', response);
            
            // Lưu session cho two-factor auth
            if (response.session) {
              localStorage.setItem('twoFactorSession', response.session);
            }
            
            setApiError('Xác thực hai yếu tố đã được bật. Vui lòng kiểm tra email để xác nhận OTP.');
            setIsSubmitting(false);
            return;
          }
          
          // Lưu thông tin đăng nhập
          await authService.saveAuth(response);
          
          // Chuyển hướng người dùng đến trang chính sau khi đăng nhập
          router.push('/dashboard');
        } else {
          // Đăng ký
          const response = await authService.register({
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password
          });
          
          // Lưu thông tin đăng nhập (tự động đăng nhập sau khi đăng ký)
          authService.saveAuth(response);
          
          // Chuyển hướng người dùng đến trang chính sau khi đăng ký
          router.push('/dashboard');
        }
      } catch (error: any) {
        console.error('Authentication error:', error);
        
        // Xử lý lỗi từ API chi tiết hơn
        if (error.response) {
          // Phản hồi từ server với mã lỗi
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 403) {
            // Trường hợp thông tin đăng nhập không đúng
            setApiError('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
          } else if (status === 400) {
            // Lỗi validation
            setApiError(typeof data === 'string' ? data : 'Thông tin nhập không hợp lệ. Vui lòng kiểm tra lại.');
          } else if (status === 409) {
            // Xung đột dữ liệu (ví dụ: email đã tồn tại)
            setApiError('Email này đã được đăng ký. Vui lòng sử dụng email khác.');
          } else if (status === 401) {
            setApiError('Bạn không có quyền truy cập. Vui lòng đăng nhập lại.');
          } else {
            // Các lỗi khác
            setApiError(typeof data === 'string' ? data : 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
          }
        } else if (error.request) {
          // Không nhận được phản hồi từ server
          setApiError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } else {
          // Lỗi trong quá trình thiết lập request
          setApiError('Có lỗi xảy ra. Vui lòng thử lại sau.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-10 max-w-xl w-full">
      <div className="flex justify-center mb-8">
        <Logo />
      </div>
      
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">
        {mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
      </h2>
      
      {apiError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {apiError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fullName">
              Họ và tên
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 text-base leading-tight focus:outline-none focus:shadow-outline ${
                errors.fullName ? 'border-red-500' : ''
              }`}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên của bạn"
              disabled={isSubmitting}
            />
            {errors.fullName && <p className="text-red-500 text-xs italic mt-1">{errors.fullName}</p>}
          </div>
        )}
        
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 text-base leading-tight focus:outline-none focus:shadow-outline ${
              errors.email ? 'border-red-500' : ''
            }`}
            value={formData.email}
            onChange={handleChange}
            placeholder="Nhập địa chỉ email"
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
        </div>
        
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Mật khẩu
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 text-base leading-tight focus:outline-none focus:shadow-outline ${
              errors.password ? 'border-red-500' : ''
            }`}
            value={formData.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            disabled={isSubmitting}
          />
          {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
        </div>
        
        {mode === 'register' && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 text-base leading-tight focus:outline-none focus:shadow-outline ${
                errors.confirmPassword ? 'border-red-500' : ''
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              disabled={isSubmitting}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs italic mt-1">{errors.confirmPassword}</p>}
          </div>
        )}
        
        {mode === 'login' && (
          <div className="mb-6 text-right">
            <a href="#" className="text-blue-500 text-sm hover:underline">
              Quên mật khẩu?
            </a>
          </div>
        )}
        
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:shadow-outline w-full text-base flex items-center justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'login' ? 'Đang đăng nhập...' : 'Đang đăng ký...'}
              </>
            ) : (
              mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'
            )}
          </button>
        </div>
      </form>
      
      <div className="mt-6 text-center">
        {mode === 'login' ? (
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        ) : (
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link href="/" className="text-blue-500 hover:underline">
              Đăng nhập
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthForm;