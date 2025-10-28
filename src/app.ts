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
import contractDocumentRoutes from '@/features/contract-documents/contract-document.routes.js';
import contractRoutes from '@/features/contracts/contract.routes.js';
import dashboardRoutes from '@/features/dashboard/dashboard.routes.js';
import { specs } from '@/documentation/swagger.config.js';
import customerRoutes from '@/features/customers/customer.routes.js';
const app: Application = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : ['http://localhost:3000'];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    
    if (origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
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
app.use('/contracts', contractRoutes);
app.use('/contractDocuments', contractDocumentRoutes);
app.use('/customers', customerRoutes);
app.use('/dashboard', dashboardRoutes);

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
