const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const pageRoutes = require("./routes/pages");
const usersRoutes = require("./routes/users");
const settingsRoutes = require("./routes/settings");
const combinationsRoutes = require("./routes/combinations");
const errorHandler = require("./middleware/errorHandler");
const cronJob = require("./helpers/cronTimer");
const { databaseURL, port, secret, jwtSecret } = require("./config");
const AppError = require("./helpers/AppError");

// app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json()); // <-------------------what is this????
app.use(express.json());
app.use(methodOverride("_method"));

/**
 * Connect to Mongo database
 */
mongoose
  .connect(databaseURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connection to Mongo db open");
  })
  .catch((err) => {
    console.log("Error connecting to Mongo db: ", err);
  });

/**
 * Populate db with numbers and their coresponding statistics
 * need to update numbers.js to newest data before going in production
 */
// const numbers = require("./helpers/numbers");
// numbers.populate();

/**
 * Api routes
 */
app.use("/api/users", usersRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/combinations", combinationsRoutes);

/**
 * Route not found
 */
app.use("*", (req, res, next) => {
  console.log(req.path);
  next(new AppError(404, 4, "Route doesnt exist, please create 404 page"));
});

/**
 * Error-handling middleware
 */
app.use(errorHandler.proccessError);

/**
 * Reccurent blocking of editing combinations on Friday 9:00AM
 * Needs to be unblocked by admin after draw (on Saturday)
 */
cronJob.start();

/**
 * Start server
 */
app.listen(port, () => {
  console.log("Lotoclub has started");
});
