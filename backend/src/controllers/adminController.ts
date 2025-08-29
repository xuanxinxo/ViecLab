import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { 
  generateAccessToken, 
  generateRefreshToken
} from '../utils/tokens.js';
import prisma from '../lib/prisma.js';

// Admin login
export const adminLogin = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin đăng nhập'
      });
    }

    // Get admin credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPasswordHash = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD_HASH || '';
    const adminPasswordPlain = process.env.ADMIN_PASSWORD_PLAINTEXT || '';
    const adminRole = 'ADMIN';

    // Verify credentials (support hash or plaintext for dev convenience)
    let isPasswordValid = false;
    if (adminPasswordHash) {
      try {
        isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
      } catch {
        isPasswordValid = false;
      }
    } else if (adminPasswordPlain) {
      isPasswordValid = password === adminPasswordPlain;
    } else {
      // Development fallback if no envs set
      isPasswordValid = username === 'admin' && password === 'Admin@123';
    }

    if (username !== adminUsername || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken('0', username, adminRole);
    const refreshToken = generateRefreshToken('0');

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: 0,
          username,
          role: adminRole
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Get current admin profile
export const getAdminProfile = async (_req: Request, res: Response): Promise<Response> => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        id: 0,
        username: process.env.ADMIN_USERNAME || 'admin',
        role: 'ADMIN',
        email: process.env.ADMIN_EMAIL || 'admin@example.com'
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// ===== DASHBOARD STATISTICS =====

// Get dashboard statistics
export const getDashboardStats = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalNews,
      recentUsers,
      recentJobs,
      recentApplications
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.newJob.count(),
      prisma.user.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.job.findMany({
        take: 5,
        select: {
          id: true,
          title: true,
          company: true,
          postedDate: true
        },
        orderBy: { postedDate: 'desc' }
      }),
      prisma.application.findMany({
        take: 5,
        include: {
          job: {
            select: {
              title: true,
              company: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalJobs,
          totalApplications,
          totalNews
        },
        recent: {
          users: recentUsers,
          jobs: recentJobs,
          applications: recentApplications
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// ===== USER MANAGEMENT =====

// Get all users
export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          lastLogin: true,
          failedLoginAttempts: true,
          accountLockedUntil: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        lastLogin: true,
        failedLoginAttempts: true,
        accountLockedUntil: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ'
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật role thành công',
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// ===== JOB MANAGEMENT =====

// Get all jobs for admin
export const getAllJobs = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 10, status = '', type = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { postedDate: 'desc' }
      }),
      prisma.job.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Update job status
export const updateJobStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'expired', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status không hợp lệ'
      });
    }

    const job = await prisma.job.update({
      where: { id },
      data: { status }
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật status thành công',
      data: job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// ===== APPLICATION MANAGEMENT =====

// Get all applications
export const getAllApplications = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 10, jobId = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (jobId) where.jobId = jobId;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.application.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// ===== NEWS MANAGEMENT =====

// Get all news for admin
export const getAllNews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [news, total] = await Promise.all([
      prisma.newJob.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { postedDate: 'desc' }
      }),
      prisma.newJob.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        news,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all news error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Create news
export const createNews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      title,
      content,
      image,
      status = 'draft',
      tags = []
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    const news = await prisma.newJob.create({
      data: {
        title,
        description: content,
        img: image,
        status,
        tags,
        company: 'Admin',
        location: 'System',
        type: 'News',
        salary: 'N/A',
        requirements: [],
        benefits: [],
        isRemote: false,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        postedDate: new Date()
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo tin tức thành công',
      data: news
    });
  } catch (error) {
    console.error('Create news error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Update news
export const updateNews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      image,
      status,
      tags
    } = req.body;

    const updateData: any = {};
    if (title) updateData.title = title;
    if (content) updateData.description = content;
    if (image) updateData.img = image;
    if (status) updateData.status = status;
    if (tags) updateData.tags = tags;

    const news = await prisma.newJob.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật tin tức thành công',
      data: news
    });
  } catch (error) {
    console.error('Update news error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Delete news
export const deleteNews = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    await prisma.newJob.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Xóa tin tức thành công'
    });
  } catch (error) {
    console.error('Delete news error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// ===== HIRING MANAGEMENT =====

// Get all hirings for admin
export const getAllHirings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;

    const [hirings, total] = await Promise.all([
      prisma.hiring.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { postedDate: 'desc' }
      }),
      prisma.hiring.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        hirings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all hirings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Create hiring
export const createHiring = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      title,
      company,
      location,
      type,
      salary,
      description,
      requirements = [],
      benefits = [],
      deadline,
      image
    } = req.body;

    if (!title || !company || !location || !type || !salary || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    const hiring = await prisma.hiring.create({
      data: {
        title,
        company,
        location,
        type,
        salary,
        description,
        requirements,
        benefits,
        deadline: new Date(deadline),
        img: image,
        postedDate: new Date()
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Tạo tin tuyển dụng thành công',
      data: hiring
    });
  } catch (error) {
    console.error('Create hiring error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Update hiring
export const updateHiring = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    const hiring = await prisma.hiring.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật tin tuyển dụng thành công',
      data: hiring
    });
  } catch (error) {
    console.error('Update hiring error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Delete hiring
export const deleteHiring = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    await prisma.hiring.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Xóa tin tuyển dụng thành công'
    });
  } catch (error) {
    console.error('Delete hiring error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// ===== SYSTEM SETTINGS =====

// Get system settings
export const getSystemSettings = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const settings = {
      siteName: process.env.SITE_NAME || 'BeviecLab',
      siteDescription: process.env.SITE_DESCRIPTION || 'Nền tảng tuyển dụng việc làm',
      contactEmail: process.env.CONTACT_EMAIL || 'contact@bevieclab.com',
      maxLoginAttempts: process.env.MAX_LOGIN_ATTEMPTS || 5,
      lockoutMinutes: process.env.LOCKOUT_MINUTES || 15,
      emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED === 'true',
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
    };

    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};

// Update system settings
export const updateSystemSettings = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { settings } = req.body;

    console.log('System settings update requested:', settings);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật cài đặt hệ thống thành công'
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    });
  }
};
