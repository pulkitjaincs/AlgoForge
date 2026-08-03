import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/database.js';

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || "",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

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
