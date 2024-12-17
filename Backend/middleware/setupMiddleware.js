import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import helmet from 'helmet';
import cors from 'cors';
import flash from 'connect-flash';

const configureApp = (app) => {
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: "http://localhost:5173",
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

  
  app.use(
    session({
      secret: process.env.SESSION_SECRET,  // Session secret for securing cookies
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production', // Secure cookies only in production (HTTPS)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // Allow cookies to be sent cross-origin
        httpOnly: true,    // Make sure cookies are not accessible via JavaScript
        maxAge: 7 * 24 * 60 * 60 * 1000,  // Set cookie expiration to 1 week
      },
      store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,  
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

};

export default configureApp;
