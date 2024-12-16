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
    cors()
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(helmet());

  // Session configurations
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV !== 'development',
        sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none',
        domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'auto',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
