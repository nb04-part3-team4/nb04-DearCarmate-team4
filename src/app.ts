import express, { Application } from 'express';
import cors from 'cors';
import {
  errorHandler,
  notFoundHandler,
} from '@/shared/middlewares/error-handler.js';
import imageRouter from '@/features/images/images.routes.js';
import carRouter from '@/features/cars/cars.routes.js';
import authRoutes from '@/features/auth/auth.routes.js';
import userRoutes from '@/features/users/user.routes.js';
import adminRoutes from '@/features/admin/admin.routes.js';
import companyRoutes from '@/features/companies/company.routes.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from '@/documentation/swagger.config.js';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('storage/uploads'));
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// API Routes
app.use('/cars', carRouter);
app.use('/images', imageRouter);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/companies', companyRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
