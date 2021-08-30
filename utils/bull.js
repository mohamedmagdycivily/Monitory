const Queue = require("bull");

const Log = require("../models/logModel");
const User = require("../models/userModel");
const sendNotification = require("./notification");
const request = require("./request");

const checkQueue = new Queue("check", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

checkQueue.process(async (job) => {
  try {
    // console.log("11111111111111111111111");

    // console.log(await checkQueue.getJob(job.jobId));
    // console.log("2222222222222222222222222222");
    // console.log(await checkQueue.getJob(job.id));
    // console.log("333333333333333333333333");

    // console.log(job.opts.jobId);

    // console.log(job.id);
    // console.log(job.data.jobId);
    // console.log();
    // let options = { repeat: { cron: `*/1 * * * *` }, jobId: job.data.jobId };
    // console.log(options);
    // console.log(await checkQueue.removeRepeatable("__default__", options));

    let repeatableJobs = await checkQueue.getRepeatableJobs();
    console.log({ repeatableJobs });

    console.log(await checkQueue.removeRepeatableByKey(repeatableJobs[0].key));
    //////////////////////////////////////////
    // console.log(job);

    // console.log("jobId = ", job.data.jobId);
    // console.log("job = ", job);

    // Queue.remove(checkQueue, "612ce75a0b5e360a51c337d6");
    console.log(job.data.doc.url);
    const res = await request[job.data.doc.protocol](job.data.doc);
    res.interval_minutes = job.data.doc.interval_minutes;
    res.date = Date.now();
    res.url = job.data.doc.url;
    res.check = job.data.doc._id;
    //   const logDoc = await Log.create(res);
    //   console.log(logDoc);
    // console.log(res);

    if (res.status === "DOWN") {
      //Notify the user
      const user = await User.findById(job.data.doc.user);
      const textInMail = `ALERT  check for ${job.data.doc.url} is DOWN !!`;
      console.log(`sending notification to ${user.email}`);

      await sendNotification.mail(user, textInMail);
    }
  } catch (err) {
    console.log("err = ", err);
  }
  //   return logDoc;
});

module.exports = checkQueue;

//   new Date().getTime() //1630318495210
//   Date.now() //1630318495210
// new Date(1630318495210) //Mon Aug 30 2021 12:14:55 GMT+0200 (Eastern European Standard Time)
