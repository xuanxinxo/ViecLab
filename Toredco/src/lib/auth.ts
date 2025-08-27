import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const adminUsers = [
  {
    id: 1,
    username: 'admin',
    password: '123456', 
    role: 'admin'
  },
  {
    id: 2,
    username: 'admin2',
    password: '123456', 
    role: 'admin'
  },
  {
    id: 3,
    username: 'admin3',
    password: '123456',
    role: 'admin'
  }
];

export interface AdminUser {
  userId: number;
  username: string;
  role: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Verify admin token (mock implementation)
export function verifyAdminToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
}

// Get user from request (từ cookie hoặc header)
export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  try {
    // Thử lấy từ cookie trước
    const token = request.cookies.get('token')?.value;
    
    if (token) {
      return verifyToken(token);
    }

    // Thử lấy từ Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return verifyToken(token);
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Get admin user from request
export function getAdminFromRequest(request: NextRequest): AdminUser | null {
  // Lấy từ cookie trước
  const cookieToken = request.cookies.get('adminToken')?.value;
  if (cookieToken) {
    const user = verifyAdminToken(cookieToken);
    if (user) return user;
  }
  // Lấy từ header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return verifyAdminToken(token);
  }
  return null;
}

// Authenticate admin user
export function authenticateAdmin(username: string, password: string): AdminUser | null {
  const user = adminUsers.find(u => u.username === username);
  if (user) {
    // Nếu password đã hash, dùng bcrypt.compareSync
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      if (bcrypt.compareSync(password, user.password)) {
        return {
          userId: user.id,
          username: user.username,
          role: user.role
        };
      }
    } else if (user.password === password) {
      return {
        userId: user.id,
        username: user.username,
        role: user.role
      };
    }
  }
  return null;
}

// Middleware để check authentication
export function requireAuth(request: NextRequest): JWTPayload {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// Middleware để check role
export function requireRole(request: NextRequest, roles: string[]): JWTPayload {
  const user = requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
} 