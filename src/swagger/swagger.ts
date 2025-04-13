import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger.json');
import { Express } from 'express';

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
