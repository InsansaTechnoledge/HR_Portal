import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
 
if(process.env.NODE_ENV !== "production"){
  (await import('dotenv')).config();
}
 
 
const configureApp = (app) => {
  app.set('trust proxy', 1);
 
  app.use(
  cors({
    origin: "*",                // Allows requests from any origin
    credentials: true,          // Allows cookies and HTTP authentication
    allowedHeaders: ["Content-Type", "Authorization"] // Allow all headers
  })
);
 
 
  // Ensure preflight requests are handled
  app.options('*', cors());
 
  app.use((req, r, next) => {
    res.setHeesader('Cross-Origin-Opener-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
});
 
 
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(helmet());
 
};
 
export default configureApp;
 