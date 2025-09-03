import { Router } from 'express';
import { 
  adminLogin, 
  getAdminProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllJobs,
  updateJobStatus,
  getAllApplications,
  getDashboardStats,
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  getAllHirings,
  createHiring,
  updateHiring,
  deleteHiring,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

// Apply rate limiting to all admin auth endpoints (temporarily disabled for testing)
// router.use(authLimiter);

// Admin authentication
router.post('/login', adminLogin);
router.get('/profile', adminAuth, getAdminProfile);

// Dashboard
router.get('/dashboard', adminAuth, getDashboardStats);

// User management
router.get('/users', adminAuth, getAllUsers);
router.get('/users/:id', adminAuth, getUserById);
router.put('/users/:id/role', adminAuth, updateUserRole);
router.delete('/users/:id', adminAuth, deleteUser);

// Job management
router.get('/jobs', adminAuth, getAllJobs);
router.put('/jobs/:id/status', adminAuth, updateJobStatus);

// Application management
router.get('/applications', adminAuth, getAllApplications);

// News management
router.get('/news', adminAuth, getAllNews);
router.post('/news', adminAuth, createNews);
router.put('/news/:id', adminAuth, updateNews);
router.delete('/news/:id', adminAuth, deleteNews);

// Hiring management
router.get('/hirings', adminAuth, getAllHirings);
router.post('/hirings', adminAuth, createHiring);
router.put('/hirings/:id', adminAuth, updateHiring);
router.delete('/hirings/:id', adminAuth, deleteHiring);

// System settings
router.get('/settings', adminAuth, getSystemSettings);
router.put('/settings', adminAuth, updateSystemSettings);

export default router;
