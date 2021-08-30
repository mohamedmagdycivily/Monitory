const Check = require("../models/checkModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const checkQueue = require("../utils/bull");

// checkQueue.on("completed", (job, result) => {
//   console.log("job.data = ", job.data);
//   console.log(`Job completed with result ${result}`);
// });
exports.createCheck = catchAsync(async (req, res, next) => {
  //   console.log(req.body);
  const doc = await Check.create(req.body);

  const data = { doc, jobId: doc._id };
  const options = {
    repeat: { cron: `*/${doc.interval_minutes * 1} * * * *` },
    jobId: doc._id,
  };

  checkQueue.add(data, options);

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.updateCheck = catchAsync(async (req, res, next) => {
  const doc = await Check.findByIdAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    next(new AppError("No document found with that id", 404));
  } else {
    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  }
});

exports.deleteCheck = catchAsync(async (req, res, next) => {
  const doc = await Check.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  } else {
    res.status(200).json({
      status: "success",
      data: null,
    });
  }
});
