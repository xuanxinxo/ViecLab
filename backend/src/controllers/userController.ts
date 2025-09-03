import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generateRandomToken, 
  getTokenExpiration 
} from '../utils/tokens.js';
import { 
  registerSchema, 
  loginSchema, 
  resetPasswordSchema, 
  forgotPasswordSchema, 
  verifyEmailSchema,
  refreshTokenSchema 
} from '../utils/validators.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
// Rate limiting is applied in the routes

const prisma = new PrismaClient();
const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS ?? 5);
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES ?? 15);

// Register a new user
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error',
        errors: validation.error.issues 
      });
    }

    const { name, email, password } = validation.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email đã được sử dụng' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const emailVerificationToken = generateRandomToken();
    const emailVerificationExpires = getTokenExpiration(24 * 60); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerificationToken,
        emailVerificationExpires,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, emailVerificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue even if email fails
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenExpires = getTokenExpiration(7 * 24 * 60); // 7 days

    // Save refresh token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpires,
      },
    });

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.' 
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        success: false,
        message: 'Thông tin đăng nhập không hợp lệ',
        errors: validation.error.issues 
      });
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Check if account is locked
    if (process.env.DISABLE_LOGIN_LOCK === 'true') {
      // do nothing – lockout disabled
    } else if (user?.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / (60 * 1000));
      return res.status(429).json({
        success: false,
        message: `Tài khoản của bạn đã bị khóa tạm thời. Vui lòng thử lại sau ${remainingMinutes} phút.`
      });
    }

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Increment failed login attempts
      if (user && process.env.DISABLE_LOGIN_LOCK !== 'true') {
        const failedAttempts = user.failedLoginAttempts + 1;
        const accountLockedUntil = failedAttempts >= MAX_LOGIN_ATTEMPTS 
          ? getTokenExpiration(LOCKOUT_MINUTES)
          : null;

        await prisma.user.update({
          where: { id: user.id },
          data: { 
            failedLoginAttempts: failedAttempts,
            accountLockedUntil
          },
        });

        const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - failedAttempts);
        
        if (remainingAttempts <= 0) {
          return res.status(429).json({
            success: false,
            message: `Tài khoản của bạn đã bị khóa tạm thời. Vui lòng thử lại sau ${LOCKOUT_MINUTES} phút.`
          });
        }

        return res.status(401).json({
          success: false,
          message: `Email hoặc mật khẩu không đúng. Bạn còn ${remainingAttempts} lần thử.`
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Check if email is verified
    // Temporarily disable email verification for development
    if (process.env.NODE_ENV === 'production' && !user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Vui lòng xác thực email trước khi đăng nhập.'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.email, user.role);
    const refreshToken = generateRefreshToken(user.id);
    const refreshTokenExpires = getTokenExpiration(7 * 24 * 60); // 7 days

    // Update user with new refresh token and reset failed attempts
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken,
        refreshTokenExpires,
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.' 
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    // User is already attached to request by auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    return res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validation = verifyEmailSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ',
        errors: validation.error.issues
      });
    }

    const { token } = validation.data;

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ',
        errors: validation.error.issues
      });
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Don't reveal if user doesn't exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.'
      });
    }

    // Generate reset token
    const passwordResetToken = generateRandomToken();
    const passwordResetExpires = getTokenExpiration(60); // 1 hour

    // Save token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires
      }
    });

    // Send reset email
    try {
      await sendPasswordResetEmail(email, passwordResetToken);
      return res.status(200).json({
        success: true,
        message: 'Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.'
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.'
      });
    }
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: validation.error.issues
      });
    }

    const { token, password } = validation.data;

    // Find user by reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        failedLoginAttempts: 0,
        accountLockedUntil: null
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<Response> => {
  try {
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token không hợp lệ',
        errors: validation.error.issues
      });
    }

    const { refreshToken } = validation.data;

    // Find user by refresh token
    const user = await prisma.user.findFirst({
      where: {
        refreshToken,
        refreshTokenExpires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);
    const refreshTokenExpires = getTokenExpiration(7 * 24 * 60); // 7 days

    // Update refresh token in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: newRefreshToken,
        refreshTokenExpires
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<Response> => {
  try {
    const refreshToken = req.body.refreshToken;
    
    if (refreshToken) {
      // Find user by refresh token and clear it
      await prisma.user.updateMany({
        where: { refreshToken },
        data: {
          refreshToken: null,
          refreshTokenExpires: null
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: req.body,
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};


// Xóa người dùng
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await prisma.user.delete({
      where: { id: user.userId },
    });

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
};

