const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Check = require("../models/checkModel");
const Log = require("../models/logModel");
const Report = require("../models/reportModel");
const mongoose = require("mongoose");

exports.getReport = catchAsync(async (req, res, next) => {
  let report = await Report.findOne({ check: req.params.id });
  const check_id = mongoose.Types.ObjectId(req.params.id);
  let logs = await Log.find({ check: req.params.id }).sort({ date: -1 });

  if (!report) {
    let report_data = await getDataFromLogs(check_id);
    report_data.status = logs[0].status;
    report = await Report.create(report_data);
  } else {
    let report_data = await getDataFromLogs(check_id, report.date);

    const totalResponse =
      report_data.responseTime * (report_data.upNumber + report_data.outages) +
      report.responseTime * (report.upNumber + report.outages);

    report.responseTime = Math.round(totalResponse / logs.length);
    report.status = logs[0].status;
    report.outages += report_data.outages;
    report.upNumber += report_data.upNumber;
    report.downtime += report_data.downtime;
    report.uptime += report_data.uptime;
    report.availability = Math.round(
      (report.upNumber / (report.upNumber + report.outages)) * 100
    );

    await report.save();
  }

  return res.status(200).json({
    status: "success",
    data: {
      report,
    },
  });
});

const getDataFromLogs = async (check_id, reportLastDate) => {
  let stats;
  if (reportLastDate) {
    stats = await Log.aggregate([
      {
        $match: { check: { $eq: check_id } },
      },
      {
        $match: {
          date: { $gt: reportLastDate },
        },
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
  } else {
    stats = await Log.aggregate([
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
  }

  let up = stats[0];
  let down = stats[1];
  let availability, outages, downtime, uptime, responseTime;

  if (up && down) {
    availability = Math.round(
      (up.status_num / (up.status_num + down.status_num)) * 100
    );
    outages = down.status_num;
    upNumber = up.status_num;
    downtime = down.interval_minutes;
    uptime = up.interval_minutes;
    responseTime = Math.round(
      (down.responseTime + up.responseTime) / (down.status_num + up.status_num)
    );
  } else if (up) {
    availability = 100;
    outages = 0;
    upNumber = up.status_num;
    downtime = 0;
    uptime = up.interval_minutes;
    responseTime = up.responseTime / up.status_num;
  } else if (down) {
    availability = 0;
    outages = down.status_num;
    upNumber = 0;
    downtime = down.interval_minutes;
    uptime = 0;
    responseTime = down.responseTime / down.status_num;
  } else {
    availability = 0;
    outages = 0;
    upNumber = 0;
    downtime = 0;
    uptime = 0;
    responseTime = 0;
  }
  const report_data = {
    // status: logs[0].status,
    availability,
    outages,
    upNumber,
    downtime,
    uptime,
    responseTime,
    date: Date.now(),
    check: check_id,
  };
  return report_data;
};
