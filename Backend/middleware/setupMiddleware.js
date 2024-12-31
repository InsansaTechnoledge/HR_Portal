import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then((dotenv) => dotenv.config());
}

const configureApp = async (app) => {
  await app.set('trust proxy', 1);

  await app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || 'https://hr-portal-5d6l.vercel.app' ||  'https://hr-portal-mu.vercel.app' , 
      credentials: true, 
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-Custom-Header',
        'Content-Disposition', 
        'Content-Length', 
      ], 
      exposedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'X-Custom-Header',
      ], 
    })
  );

  // Handle preflight requests explicitly
await app.options('/api/payslip/generate', cors());


  await app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || 'https://hr-portal-5d6l.vercel.app'); 
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
  });

  await app.use(express.json());
  await app.use(express.urlencoded({ extended: true }));
  await app.use(cookieParser());
  await app.use(helmet());
};

export default configureApp;
