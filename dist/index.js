import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { setupSwagger } from './swagger/swagger.js';
import { errorHandler } from './middleware/errorMiddleware.js';
dotenv.config();
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
// Swagger
setupSwagger(app);
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);
// Error Handling Middleware
app.use(errorHandler);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
