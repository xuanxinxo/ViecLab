import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const adminAuth = (req: Request, res: Response, next: NextFunction): void | Response => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
               req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập. Vui lòng đăng nhập lại.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    
    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Truy cập bị từ chối. Bạn không có quyền admin.'
      });
    }

    // Add user from payload
    (req as any).user = decoded;
    next();
    return; // Explicit return after next() to satisfy TypeScript
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
    });
  }
};
