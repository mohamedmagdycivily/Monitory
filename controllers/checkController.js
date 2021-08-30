const Check = require("../models/checkModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const checkQueue = require("../utils/bull");

// checkQueue.on("completed", (job, result) => {
//   console.log("job.data = ", job.data);
//   console.log(`Job completed with result ${result}`);
// });

const deleteJob = async (doc) => {
  let repeatableJobs = await checkQueue.getRepeatableJobs();

  for (const { key, id } of repeatableJobs) {
    if (id === doc.id) {
      console.log(`deleting job id = ${id} doc.id=${doc.id}`);
      await checkQueue.removeRepeatableByKey(key);
      console.log("Job deleted");
      break;
    }
  }
};

const createJob = (doc) => {
  const data = { doc, jobId: doc.id };
  const options = {
    repeat: { cron: `*/${doc.interval_minutes * 1} * * * *` },
    jobId: doc.id,
  };

  checkQueue.add(data, options);
  console.log("job created");
};

exports.createCheck = catchAsync(async (req, res, next) => {
  //   console.log(req.body);
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

exports.pause = catchAsync(async (req, res, next) => {
  const doc = await Check.findById(req.params.id);
  if (req.body.pause === true && doc.pause === false) {
    doc.pause = req.body.pause;
    deleteJob(doc);
  } else if (req.body.pause === false && doc.pause === true) {
    doc.pause = req.body.pause;
    createJob(doc);
  }
  await doc.save();
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
});

exports.deleteCheck = catchAsync(async (req, res, next) => {
  const doc = await Check.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError("No document found with that ID", 404));
  } else {
    //delete the Job created by the check
    deleteJob(doc);

    res.status(200).json({
      status: "success",
      data: null,
    });
  }
});
