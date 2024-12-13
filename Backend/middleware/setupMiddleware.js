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

  app.use(
    cors({
      origin: process.env.CLIENT_BASE_URL,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(helmet());

  //session configirations
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV !== "development",
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
        domain: process.env.NODE_ENV === "development" ? "localhost" : "auto",
        maxAge: 7 * 24 * 60 * 60 * 1000,
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
