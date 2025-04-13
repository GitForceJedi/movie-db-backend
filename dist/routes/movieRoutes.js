import express from 'express';
import { getAllMovies, getMovieById, createMovie } from '../controllers/movieController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', getAllMovies); // Supports ?rating and ?stars
router.get('/:id', getMovieById);
router.post('/', authenticateToken, createMovie);
export default router;
