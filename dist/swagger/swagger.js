import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
// Dynamically read the JSON file (ESM-safe approach)
const swaggerDocument = JSON.parse(fs.readFileSync(path.resolve('src/swagger/swagger.json'), 'utf-8'));
export function setupSwagger(app) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
