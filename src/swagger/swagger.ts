import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import fs from 'fs';
import path from 'path';

// Dynamically read the JSON file (ESM-safe approach)
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.resolve('src/swagger/swagger.json'), 'utf-8')
);

export function setupSwagger(app: Express): void {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
