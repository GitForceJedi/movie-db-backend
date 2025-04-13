import express from 'express';
import { createReview, getReviewById, getFilteredReviews, } from '../controllers/reviewController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/:id', getReviewById); // NEW: Get review by review ID
router.get('', getFilteredReviews); // Supports ?rating, ?reviewerType, ?movieId, ?stars
router.post('/:movieId', authenticateToken, createReview); // Still accepts movieId for creation
export default router;
