// routes/importRoutes.js
import express from 'express';
import { importDarazReviews } from '../controllers/importController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/reviews/:productId', protect, admin, importDarazReviews);

export default router;