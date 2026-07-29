import 'dotenv/config';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const startServer = async () => {
    try {
        await prisma.$connect();
        logger.info('✅ Database connected');
    } catch (error) {
        logger.error({ error }, '❌ Database connection failed');
        process.exit(1);
    }

    const server = app.listen(env.PORT, () => {
        logger.info(`🚀 Server running at http://localhost:${env.PORT}`);
    });

    const shutdown = async (signal: string) => {
        logger.info(`${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            await prisma.$disconnect();
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();
