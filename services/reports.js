const mongoose = require("mongoose");
const Log = require("../models/logModel");

exports.getDataFromLogs = async (checkId, reportLastDate) => {
  let stats;
  const filter = { check: { $eq: mongoose.Types.ObjectId(checkId) } };
  if (reportLastDate) filter.date = { $gt: reportLastDate };
  stats = await Log.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: "$status",
        status: { $first: "$status" },
        count: { $sum: 1 },
        interval_minutes: { $sum: "$interval_minutes" },
        responseTime: { $sum: "$responseTime" },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]).then((results) =>
    results.reduce((agg, result) => {
      agg[result.status] = result;
      return agg;
    }, {})
  );

  let up = stats.UP;
  let down = stats.DOWN;

  let availability = 0,
    outages = 0,
    downtime = 0,
    uptime = 0,
    upNumber = 0,
    responseTime = 0;

  if (up && down) {
    availability = Math.round((up.count / (up.count + down.count)) * 100);
    outages = down.count;
    upNumber = up.count;
    downtime = down.interval_minutes;
    uptime = up.interval_minutes;
    responseTime = Math.round(
      (down.responseTime + up.responseTime) / (down.count + up.count)
    );
  } else if (up) {
    availability = 100;
    upNumber = up.count;
    uptime = up.interval_minutes;
    responseTime = up.responseTime / up.count;
  } else if (down) {
    outages = down.count;
    downtime = down.interval_minutes;
    responseTime = down.responseTime / down.count;
  }
  return {
    availability,
    outages,
    upNumber,
    downtime,
    uptime,
    responseTime,
    date: Date.now(),
    check: checkId,
  };
};

exports.mergeReportWithDiff = (report, reportDiff, newStatus) => {
  const totalResponse =
    reportDiff.responseTime * (reportDiff.upNumber + reportDiff.outages) +
    report.responseTime * (report.upNumber + report.outages);
  report.status = newStatus;
  report.outages += reportDiff.outages;
  report.upNumber += reportDiff.upNumber;

  report.responseTime = Math.round(
    totalResponse / (report.outages + report.upNumber)
  );
  report.downtime += reportDiff.downtime;
  report.uptime += reportDiff.uptime;
  report.availability = Math.round(
    (report.upNumber / (report.upNumber + report.outages)) * 100
  );
  report.date = Date.now();
  return report;
};
