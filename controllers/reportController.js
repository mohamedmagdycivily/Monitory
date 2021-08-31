const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Check = require("../models/checkModel");
const Log = require("../models/logModel");
const Report = require("../models/reportModel");
const mongoose = require("mongoose");

exports.getReport = catchAsync(async (req, res, next) => {
  let report = await Report.findOne({ check: req.params.id })[0];
  const check_id = mongoose.Types.ObjectId(req.params.id);

  let logs;
  if (!report) {
    const stats = await Log.aggregate([
      {
        $match: { check: { $eq: check_id } },
      },
      {
        $group: {
          _id: "$status",
          status_num: { $sum: 1 },
          interval_minutes: { $sum: "$interval_minutes" },
          responseTime: { $sum: "$responseTime" },
        },
      },
      {
        $addFields: { status: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { status: -1 },
      },
    ]);

    let up = stats[0];
    let down = stats[1];

    logs = await Log.find({ check: req.params.id }).sort({ date: -1 });

    const report_data = {
      status: logs[0].status,
      availability: Math.round(
        (up.status_num / (up.status_num + down.status_num)) * 100
      ),
      outages: down.status_num,
      downtime: down.interval_minutes,
      uptime: up.interval_minutes,
      responseTime: Math.round((down.responseTime + up.responseTime) / 2),
      date: Date.now(),
      check: check_id,
    };
    report = await Report.create(report_data);
  }

  return res.status(200).json({
    status: "success",
    data: {
      report,
    },
  });
});
