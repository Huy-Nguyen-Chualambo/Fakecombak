import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Kiểm tra nếu người dùng đang cố truy cập các trang yêu cầu xác thực
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Lấy token từ cookie hoặc localStorage (trong trường hợp này là cookie)
    const token = request.cookies.get('token')?.value;

    // Nếu không có token, chuyển hướng về trang đăng nhập
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Nếu người dùng đã đăng nhập và cố truy cập trang đăng nhập/đăng ký
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/register') {
    const token = request.cookies.get('token')?.value;
    
    // Nếu có token, chuyển hướng đến dashboard
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Áp dụng middleware cho các đường dẫn chỉ định
export const config = {
  matcher: ['/', '/register', '/dashboard/:path*'],
};