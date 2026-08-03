import swaggerUi from 'swagger-ui-express';
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { Application } from 'express';

const registry = new OpenAPIRegistry();

// Define components/security
registry.registerComponent('securitySchemes', 'cookieAuth', {
  type: 'apiKey',
  in: 'cookie',
  name: 'token',
});

// Create the generator
const generator = new OpenApiGeneratorV3(registry.definitions);

export const setupSwagger = (app: Application) => {
  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'AlgoForge API',
      description: 'API for AlgoForge application',
    },
    servers: [{ url: '/api/v1' }],
  });

  app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(document));
};
