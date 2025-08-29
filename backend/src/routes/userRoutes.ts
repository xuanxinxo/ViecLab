import { Router } from 'express';
import { 
  register, 
  login, 
  getCurrentUser, 
  updateUser, 
  deleteUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout
} from '../controllers/userController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema,
  resetPasswordSchema, 
  refreshTokenSchema 
} from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Apply rate limiting to all auth endpoints
router.use(authLimiter);

// Đăng ký người dùng mới
router.post('/register', validateRequest(registerSchema), register);

// Xác thực email
router.get('/verify-email/:token', verifyEmail);

// Đăng nhập
router.post('/login', validateRequest(loginSchema), login);

// Làm mới token
router.post('/refresh-token', validateRequest(refreshTokenSchema), refreshToken);

// Đăng xuất
router.post('/logout', auth, logout);

// Quên mật khẩu
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);

// Đặt lại mật khẩu
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), resetPassword);

// Lấy thông tin người dùng hiện tại
router.get('/me', auth, getCurrentUser);

// Cập nhật thông tin người dùng
router.put('/me', auth, updateUser);

// Xóa tài khoản người dùng
router.delete('/me', auth, deleteUser);

export default router;
