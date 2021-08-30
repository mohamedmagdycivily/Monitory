const Check = require("../models/checkModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const checkQueue = require("../utils/bull");
const Logs = require("../models/logModel");

exports.getReport = (req, res, next) => {
  return res.end("hi from get report ");
};
