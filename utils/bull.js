const Queue = require("bull");
const mongoose = require("mongoose");

const Log = require("../models/logModel");
const User = require("../models/userModel");
const notificationChannels = require("./notification");
const request = require("./request");
const axios = require("../utils/axios");
const checkQueue = new Queue("check", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

checkQueue.process(async (job) => {
  try {
    console.log(job.data.doc.url);
    //test the url
    const res = await request[job.data.doc.protocol](job.data.doc);

    res.interval_minutes = job.data.doc.interval_minutes;
    res.date = Date.now();
    res.url = job.data.doc.url;
    res.check = job.data.doc._id;
    //create log
    // const logDoc = await Log.create(res);

    if (res.status === "DOWN") {
      //Notify the user if DOWN
      const threshold = job.data.doc.threshold;
      if (threshold > 1) {
        const filter = {
          check: { $eq: mongoose.Types.ObjectId(job.data.doc._id) },
        };
        const arr = await Log.aggregate([
          {
            $match: filter,
          },
          {
            $sort: { date: -1 },
          },
          {
            $limit: threshold,
          },
          {
            $match: { status: { $eq: "DOWN" } },
          },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]);
        const numDown = arr[0].count;
        console.log({ numDown });
        if (numDown < threshold) {
          console.log(threshold);
          return;
        }
      }

      const user = await User.findById(job.data.doc.user);
      console.log(`sending notification to ${user.email}`);
      //sending notification through notification channel
      // notificationChannels.forEach((channel) =>
      //   channel.notify(user, job.data.doc)
      // );
      //sending post request with notification to webhook
      if (job.data.doc.webhook) {
        axios.post(job.data.doc.webhook, {
          message: `ALERT  check for : ${job.data.doc.url} is DOWN !!`,
        });
      }
    }
  } catch (err) {
    console.log("err = ", err);
  }
});

module.exports = checkQueue;
