const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const helmet = require("helmet");
const cors = require("cors");
const flash = require("connect-flash");

module.exports = (app) => {
  app.set("trust proxy", 1);
  const cors = require('cors');

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
        sameSite: 'None',  // Allow cookies to be sent cross-origin
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
