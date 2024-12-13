require("dotenv").config();
require("../config/passport");
const express = require("express");
const errorHandler = require("../middleware/errorHandler");
const setupMiddleware = require("../middleware/setupMiddleware");
const routes = require("../routes/routes")
const app = express();

//setup middleware
setupMiddleware(app);

//routes
routes(app);

//error handling Middleware
app.use(errorHandler);

module.exports = app;