import express from 'express';
import errorHandler from '../middleware/errorHandler.js';
import setupMiddleware from '../middleware/setupMiddleware.js';
import routes from '../routes/routes.js';

if(process.env.NODE_ENV !== "production"){
    (await import('dotenv')).config();

}

const app = express();

// Setup middleware
setupMiddleware(app);
// Routes
routes(app);

// Error handling middleware
app.use(errorHandler);

export default app;
