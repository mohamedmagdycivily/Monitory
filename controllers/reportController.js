const mongoose = require("mongoose");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Check = require("../models/checkModel");
const Log = require("../models/logModel");
const Report = require("../models/reportModel");
const APIFeatures = require("../utils/apiFeatures");
const { mergeReportWithDiff, getDataFromLogs } = require("../services/reports");

exports.getReport = catchAsync(async (req, res, next) => {
  const check = await Check.findById(req.params.id);
  if (!check) {
    throw new AppError("Check not found", 404);
  }
  if (check.user.toString() === req.params.id) {
    throw new AppError("You don't have access to this check", 402);
  }
  let report = await Report.findOne({ check: req.params.id });
  let lastLog = await Log.findOne({ check: req.params.id }).sort({ date: -1 });
  const features = new APIFeatures(
    Log.find({ check: req.params.id }).sort({ date: -1 }),
    req.query
  );
  const history = await features.paginate().query;

  if (!report) {
    let reportDiff = await getDataFromLogs(req.params.id);
    //for testing purpose instead of reportDiff.status = lastLog.status
    if (!lastLog) {
      throw new AppError(
        "there is no report please wait for 10 minutes and check again ",
        404
      );
    }
    reportDiff.status = lastLog.status;
    // reportDiff.status = lastLog ? lastLog.status : "DOWN";
    //Save snapshot
    report = await Report.create(reportDiff);
  } else {
    let reportDiff = await getDataFromLogs(req.params.id, report.date);
    //for testing purpose instead of lastLogStatus = lastLog.status
    // lastLogStatus = lastLog ? lastLog.status : "DOWN";
    lastLogStatus = lastLog.status;
    mergeReportWithDiff(report, reportDiff, lastLogStatus);
    await report.save();
  }
  // preparing report to send
  report = report.toObject();
  delete report.upNumber;
  report.logs = history;

  return res.status(200).json({
    status: "success",
    data: report,
  });
});

exports.getReportsByTag = catchAsync(async (req, res) => {
  const checks = await Check.find({ tags: req.query.tag, user: req.user.id });
  const reports = await Promise.all(
    checks.map(async (check) => {
      let report = await Report.findOne({ check: check.id });
      let lastLog = await Log.findOne({ check: check.id }).sort({
        date: -1,
      });
      const features = new APIFeatures(
        Log.find({ check: check.id }).sort({ date: -1 }),
        req.query
      );
      const history = await features.paginate().query;

      if (!report) {
        let reportDiff = await getDataFromLogs(check.id);
        reportDiff.status = lastLog.status;
        //Save snapshot
        report = await Report.create(reportDiff);
      } else {
        let reportDiff = await getDataFromLogs(check.id, report.date);
        mergeReportWithDiff(report, reportDiff, lastLog.status);
        await report.save();
      }
      // preparing report to send
      report = report.toObject();
      delete report.upNumber;
      report.logs = history;
      return report;
    })
  );
  return res.json({
    status: "success",
    data: reports,
  });
});
