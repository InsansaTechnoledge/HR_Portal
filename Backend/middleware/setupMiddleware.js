import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then((dotenv) => dotenv.config());
}

const configureApp = (app) => {
  app.set('trust proxy', 1);

  app.use(
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
app.options('/api/payslip/generate', cors());


 app.use(function (req, res, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(helmet());
};

export default configureApp;
