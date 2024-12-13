import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const configureApp = (app) => {
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: `${process.env.CLIENT_BASE_URL}`,
      credentials: true, 
      allowedHeaders: ['Content-Type', 'Authorization'], 
    }
  ));
  
  // Ensure preflight requests are handled
  app.options('*', cors()); 
  
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none'); 
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); 
    next();
});


  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(helmet());

};

export default configureApp;
