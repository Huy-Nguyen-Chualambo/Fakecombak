'use client';

import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiXCircle } from 'react-icons/fi';
import authService from '@/app/services/authService';
import api from '@/app/services/api';

interface UserProfile {
  id?: number;
  fullName: string;
  email: string;
  mobile?: string;
  role?: string;
  createdAt?: string;
  twoFactorAuth?: {
    enabled: boolean;
  };
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        // Kiểm tra xem user đã được lưu trong localStorage chưa
        const localUser = authService.getCurrentUser();
        if (localUser) {
          setUser(localUser);
        }

        // Lấy thông tin mới nhất từ backend
        const response = await api.get('/api/users/profile');
        const userData = response.data;
        
        setUser(userData);
        setEditedUser(userData);
        
        // Cập nhật thông tin user vào localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser(user);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser(user);
    setUpdateSuccess(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedUser) return;

    try {
      const response = await api.put('/api/users/profile', {
        fullName: editedUser.fullName,
        mobile: editedUser.mobile,
      });

      if (response.status === 200) {
        setUser(editedUser);
        localStorage.setItem('user', JSON.stringify(editedUser));
        setUpdateSuccess(true);
        setTimeout(() => {
          setIsEditing(false);
          setUpdateSuccess(false);
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="text-yellow-600">Không tìm thấy thông tin người dùng.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Thông tin tài khoản</h3>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin cá nhân của bạn
          </p>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={editedUser?.fullName || ''}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Họ và tên"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editedUser?.email || ''}
                    className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                    placeholder="Email"
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
              </div>

              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="mobile"
                    name="mobile"
                    value={editedUser?.mobile || ''}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Số điện thoại"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiSave className="mr-2 -ml-1 h-4 w-4" />
                  Lưu thay đổi
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiXCircle className="mr-2 -ml-1 h-4 w-4" />
                  Hủy
                </button>
              </div>

              {updateSuccess && (
                <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-md text-sm">
                  Thông tin đã được cập nhật thành công!
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center py-2">
                <FiUser className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-500 w-24">Họ và tên:</span>
                <span className="ml-2 text-sm text-gray-900">{user.fullName}</span>
              </div>
              
              <div className="flex items-center py-2">
                <FiMail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-500 w-24">Email:</span>
                <span className="ml-2 text-sm text-gray-900">{user.email}</span>
              </div>
              
              <div className="flex items-center py-2">
                <FiPhone className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-500 w-24">Số điện thoại:</span>
                <span className="ml-2 text-sm text-gray-900">{user.mobile || 'Chưa cập nhật'}</span>
              </div>
              
              <button
                onClick={handleEdit}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiEdit2 className="mr-2 -ml-1 h-4 w-4" />
                Chỉnh sửa thông tin
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Bảo mật</h3>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thiết lập bảo mật tài khoản
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-base font-medium text-gray-800">Xác thực hai lớp</h4>
              <p className="mt-1 text-sm text-gray-500">
                Bảo vệ tài khoản của bạn với lớp bảo mật bổ sung
              </p>
            </div>
            <div className="flex items-center">
              <span className="mr-3 text-sm text-gray-500">
                {user.twoFactorAuth?.enabled ? 'Đã bật' : 'Đã tắt'}
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.twoFactorAuth?.enabled || false}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <button
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              disabled
            >
              Cài đặt xác thực hai lớp
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Hoạt động tài khoản</h3>
          <p className="mt-1 text-sm text-gray-500">
            Xem nhật ký hoạt động gần đây của bạn
          </p>
        </div>

        <div className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">Tính năng đang được phát triển</p>
          </div>
        </div>
      </div>
    </div>
  );
}