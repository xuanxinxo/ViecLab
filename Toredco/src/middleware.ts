import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kiểm tra nếu đang truy cập admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Bỏ qua trang login
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Kiểm tra token trong cookie hoặc header
    const token = request.cookies.get('adminToken')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      // Redirect đến trang login nếu không có token
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Trong thực tế, verify token ở đây
    // try {
    //   jwt.verify(token, JWT_SECRET);
    // } catch (error) {
    //   return NextResponse.redirect(new URL('/admin/login', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
}; 