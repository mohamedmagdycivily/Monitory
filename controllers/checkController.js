const Check = require("../models/checkModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const checkQueue = require("../utils/bull");
const Logs = require("../models/logModel");

const deleteJob = async (doc) => {
  let repeatableJobs = await checkQueue.getRepeatableJobs();

  for (const { key, id } of repeatableJobs) {
    if (id === doc.id) {
      await checkQueue.removeRepeatableByKey(key);

      break;
    }
  }
};

const createJob = (doc) => {
  const data = { doc, failed: 0, jobId: doc.id };
  const options = {
    repeat: { cron: `*/${doc.interval_minutes * 1} * * * *` },
    jobId: doc.id,
  };

  checkQueue.add(data, options);
};

exports.createCheck = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;

  const doc = await Check.create(req.body);
  createJob(doc);

  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.updateCheck = catchAsync(async (req, res, next) => {
  if (req.body.pause) {
    delete req.body.pause;
  }
  const doc = await Check.findByIdAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doc) {
    next(new AppError("No document found with that id", 404));
  } else {
    await deleteJob(doc);
    createJob(doc);

    res.status(200).json({
      status: "success",
      data: {
        data: doc,
      },
    });
  }
});

exports.setCheckActiveState = catchAsync(async (req, res, next) => {
  const doc = await Check.findById(req.params.id).populate("user");
  if (!doc) {
    throw new AppError("Check not found", 404);
  }
  if (req.user.id !== doc.user.id) {
    console.log("req.user.id = ", req.user.id);
    console.log("doc.user.id = ", doc.user.id);
    throw new AppError("you are not allowed to pause other users checks", 402);
  }

  if (req.body.isActive === true && doc.isActive === false) {
    createJob(doc);
  } else if (req.body.isActive === false && doc.isActive === true) {
    deleteJob(doc);
  }
  if (doc.isActive !== req.body.isActive) {
    doc.isActive = req.body.isActive;
    await doc.save();
  }
  return res.status(200).json({
    status: "success",
    data: doc,
  });
});

exports.deleteCheck = catchAsync(async (req, res, next) => {
  const doc = await Check.findByIdAndDelete(req.params.id);
  if (!doc) {
    throw new AppError("No document found with that ID", 404);
  } else {
    //delete the Job created by the check
    deleteJob(doc);
    //delete logs associated with that check
    await Logs.deleteMany({ check: doc });
    res.status(200).json({
      status: "success",
      data: null,
    });
  }
});
