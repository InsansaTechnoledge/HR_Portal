require("dotenv").config();
const express = require("express");
const routes = require("../routes/routes")
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routes
routes(app);


module.exports = app;