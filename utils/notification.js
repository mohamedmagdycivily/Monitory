const Email = require("./email");

const notificationChannels = [
  {
    notify: async (user, check) => {
      try {
        await new Email(
          user,
          `ALERT  check for ${check.url} is DOWN !!`
        ).sendMail("Alert from Monitory .. Your website is DOWN");
      } catch (err) {
        console.log("err = ", err);
      }
    },
  },
  {
    notify: async (user, check) => {
      try {
        //send post request to webhook
      } catch (err) {
        console.log("err = ", err);
      }
    },
  },
];

module.exports = notificationChannels;
