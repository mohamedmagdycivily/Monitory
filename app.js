const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");

const userRouter = require("./routes/userRoutes");
const checkRouter = require("./routes/checkRoutes");
const reportRouter = require("./routes/reportRoute");
// const historyRouter = require("./routes/historyModel");

//middleware
app.use(morgan("dev"));
app.use(cors());
// Body parser, reading data from body into req.body
app.use(express.json());
app.use(cookieParser());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //   console.log(req.body);
  // console.log(req.cookies);
  next();
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/checks", checkRouter);
app.use("./api/v1/reports", reportRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// Check.create({
//   name: "user1@gmail.com",
//   url: "user1234",
//   protocol: "HTTP",
// }).then(() => console.log("user created"));

// app.use("/api/v1/products", productRouter);
// app.use("/api/v1/cart", cartRouter);
