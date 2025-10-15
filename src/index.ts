import dotenv from 'dotenv';
import app from './app';
import { connectDatabase, disconnectDatabase } from '@/middlewares/prisma';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║   🚗 Dear Carmate API Server         ║
║   Server is running on port ${PORT}     ║
║   Environment: ${process.env.NODE_ENV || 'development'}            ║
╚═══════════════════════════════════════╝
      `);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API base: http://localhost:${PORT}/api-docs`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Closing server gracefully...`);

      server.close(async () => {
        console.log('✅ Server closed successfully');
        await disconnectDatabase();
        process.exit(0);
      });

      setTimeout(() => {
        console.error('⚠️  Forcefully shutting down after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
