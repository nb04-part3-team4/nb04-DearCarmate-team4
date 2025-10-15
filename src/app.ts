import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from '@/middlewares/error-handler.js';
import imageRouter from '@/routes/images.routes.js';
import carRouter from '@/routes/cars.routes.js';
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import adminRoutes from '@/routes/admin.routes';
import companyRoutes from '@/routes/company.routes';
import contractDocumentRoutes from '@/routes/contract-document.route';
import swaggerUi from 'swagger-ui-express';
import { specs } from '@/swagger.config.js';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
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
app.use('/contractDocuments', contractDocumentRoutes);

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
