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
    console.log(job.data.doc.url);
    //test the url
    const res = await request[job.data.doc.protocol](job.data.doc);

    res.interval_minutes = job.data.doc.interval_minutes;
    res.date = Date.now();
    res.url = job.data.doc.url;
    res.check = job.data.doc._id;
    //create log
    //   const logDoc = await Log.create(res);
    //   console.log(logDoc);
    console.log(res);

    if (res.status === "DOWN") {
      //Notify the user if DOWN
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
