const Email = require("./email");

const sendNotification = {
  mail: async (user, textInMail) => {
    try {
      await new Email(user, textInMail).sendMail(
        "Alert from Monitory .. Your website is DOWN"
      );
    } catch (err) {
      console.log("err = ", err);
    }
  },
};

module.exports = sendNotification;
