import { Router } from 'express';
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/newsController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', getAllNews);
router.get('/:id', getNewsById);

// Protected routes (require authentication)
router.post('/', auth, createNews);
router.put('/:id', auth, updateNews);
router.delete('/:id', auth, deleteNews);

export default router;
