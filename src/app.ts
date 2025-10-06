import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from '@/middlewares/error-handler';
import authRoutes from '@/routes/auth.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/auth', authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
