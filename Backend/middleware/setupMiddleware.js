import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then((dotenv) => dotenv.config());
}

const configureApp = async (app) => {
  app.set('trust proxy', 1);

// CORS middleware
app.use(
  cors({
    origin: ['https://hr-portal-5d6l.vercel.app', 'https://hr-portal-mu.vercel.app'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  })
);

// Preflight request handling
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || 'https://hr-portal-5d6l.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(204).send();
});

// Additional middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

};

export default configureApp;
