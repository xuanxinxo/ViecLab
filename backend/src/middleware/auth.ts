import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập để truy cập tài nguyên này' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number; username?: string; role?: string };
    
    // Check if this is an admin token (userId = 1, 2, 3 and role = 'admin')
    if ((decoded.userId === 1 || decoded.userId === 2 || decoded.userId === 3) && decoded.role === 'admin') {
      // Admin user - create mock user object
      req.user = {
        id: decoded.userId.toString(),
        name: decoded.username || 'admin',
        email: 'admin@example.com',
        createdAt: new Date(),
        role: 'admin'
      };
      return next();
    }

    // Regular user - find in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Người dùng không tồn tại' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ' });
  }
};