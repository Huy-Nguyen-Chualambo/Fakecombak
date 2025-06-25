'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import authService from '@/app/services/authService';
import { LuMenu } from 'react-icons/lu';

interface SidebarItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Mặc định mở trên desktop
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
    // Get user information only on the client side
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Kiểm tra kích thước màn hình khi component mount và khi resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px là breakpoint cho lg của Tailwind
    };
    
    // Kiểm tra lần đầu
    checkIsMobile();
    
    // Thêm event listener
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Đảm bảo sidebar luôn đóng khi ở chế độ mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Tổng quan',
      path: '/dashboard',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      title: 'Tài khoản',
      path: '/dashboard/account',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      title: 'Tiền ảo',
      path: '/dashboard/crypto',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Thiết lập',
      path: '/dashboard/settings',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    authService.logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Xử lý click vào logo khi sidebar đang thu nhỏ
  const handleLogoClick = () => {
    if (!sidebarOpen && !isMobile) {
      setSidebarOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Overlay cho mobile */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 bg-white shadow-lg 
          transition-all duration-300 ease-in-out transform
          ${isMobile 
            ? `w-64 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
            : sidebarOpen ? 'w-64' : 'w-16'
          }
        `}
      >
        {/* Logo section - bây giờ có thể click khi sidebar thu nhỏ */}
        <div 
          className={`
            flex items-center h-16
            ${!sidebarOpen && !isMobile ? 'justify-center px-0 cursor-pointer' : 'justify-between px-4'}
          `}
          onClick={!sidebarOpen && !isMobile ? handleLogoClick : undefined}
        >
          <div className={`flex items-center overflow-hidden ${!sidebarOpen && !isMobile ? 'justify-center w-full' : ''}`}>
            <div className={`flex-shrink-0 ${!sidebarOpen && !isMobile ? 'cursor-pointer flex justify-center' : ''}`}>
              <Image
                src="/logo.png"
                alt="Logo"
                width={!sidebarOpen && !isMobile ? 36 : 42}
                height={!sidebarOpen && !isMobile ? 36 : 42}
                className="object-contain"
              />
            </div>
            <div className={`ml-2 whitespace-nowrap transition-all duration-300 ${!sidebarOpen && !isMobile ? 'opacity-0 w-0 absolute' : 'opacity-100 w-auto'}`}>
              <span className="font-semibold text-blue-600 text-xl">Fake</span>
              <span className="font-semibold text-gray-800 text-xl">combank</span>
            </div>
          </div>
        </div>

        <div className={`${!sidebarOpen && !isMobile ? 'px-2' : 'px-4'} pb-6 h-[calc(100%-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
          <nav className="mt-6 space-y-1.5">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={`
                  flex items-center group rounded-md
                  ${sidebarOpen || isMobile ? 'px-4 py-2.5' : 'justify-center p-2.5'} 
                  ${pathname === item.path 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                  transition-all duration-200
                `}
                title={!sidebarOpen && !isMobile ? item.title : ''}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                
                <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${!sidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                  {item.title}
                </span>
                
                {/* Tooltip cho chế độ thu gọn */}
                {!sidebarOpen && !isMobile && (
                  <div className="absolute left-12 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100 whitespace-nowrap">
                    {item.title}
                  </div>
                )}
              </Link>
            ))}
            
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center group rounded-md
                ${sidebarOpen || isMobile ? 'px-4 py-2.5' : 'justify-center p-2.5'} 
                text-gray-600 hover:text-red-600 hover:bg-red-50
                transition-all duration-200
              `}
              title={!sidebarOpen && !isMobile ? 'Đăng xuất' : ''}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              
              <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${!sidebarOpen && !isMobile ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                Đăng xuất
              </span>
              
              {/* Tooltip cho chế độ thu gọn */}
              {!sidebarOpen && !isMobile && (
                <div className="absolute left-12 scale-0 rounded bg-gray-800 p-2 text-xs text-white group-hover:scale-100">
                  Đăng xuất
                </div>
              )}
            </button>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${isMobile ? '' : sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        <header className="sticky top-0 z-20 bg-white border-b h-16 flex items-center justify-between px-6">
          <div className="flex items-center">
            {/* Biểu tượng hamburger - chỉ hiển thị và có thể click khi sidebar đang mở hoặc trên mobile */}
            {(sidebarOpen || isMobile) && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-label="Toggle sidebar"
              >
                <LuMenu className="w-5 h-5" />
              </button>
            )}
            
            {/* Xin chào, User! (Personalized greeting) - Only render user-specific content on client side */}
            <div className="ml-3">
              {isClient ? (
                <h2 className="text-lg font-medium text-gray-800">
                  Xin chào, {user?.fullName || 'Khách hàng'}!
                </h2>
              ) : (
                <h2 className="text-lg font-medium text-gray-800">
                  Xin chào, Khách hàng!
                </h2>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isClient ? (
              <span className="hidden sm:block text-sm text-gray-700">
                {user?.fullName || 'Người dùng'}
              </span>
            ) : (
              <span className="hidden sm:block text-sm text-gray-700">
                Người dùng
              </span>
            )}
            <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
              {isClient ? (
                <span className="text-lg font-bold text-gray-600">
                  {user?.fullName?.[0]?.toUpperCase() || 'U'}
                </span>
              ) : (
                <span className="text-lg font-bold text-gray-600">
                  U
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}