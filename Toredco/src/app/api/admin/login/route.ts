// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
// import { authenticateAdmin } from '@/lib/auth'; 
import { authenticateAdmin } from '@/src/lib/auth';  // ← cập nhật path cho gọn  
// ← cập nhật path cho gọn
import jwt from 'jsonwebtoken';
import { serverCookieHelper } from '@/src/lib/cookieHelper';
export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/* POST /api/admin/login */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 },
      );
    }

    /* 1. Xác thực admin */
    const user = authenticateAdmin(username, password);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 },
      );
    }

    /* 2. Tạo JWT */
    const token = jwt.sign(
      {
        userId: user.userId,
        // ⇐ đổi thành user.userId nếu hàm trả về như vậy
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    /* 3. Trả response + set cookie */
    const response = NextResponse.json({
      token,
      success: true,
      data: {
        user: {
          userId: user.userId,

          username: user.username,
          role: user.role,
        },
      },
      message: 'Login successful',
    });

    serverCookieHelper.setTokenToResponse(response, token);

    /* 4. Thêm CORS header (nếu gọi từ domain khác) */
    // Set CORS headers dynamically
    const origin = request.headers.get('origin') || '';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}

/* OPTIONS cho CORS pre-flight */
export async function OPTIONS() {
  const res = new NextResponse(null, { status: 200 });
  res.headers.set('Access-Control-Allow-Origin', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return res;
}
