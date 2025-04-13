import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger.json');
export function setupSwagger(app) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
