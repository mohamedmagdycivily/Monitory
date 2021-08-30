const { CheckStatus } = require("../utils/constants");
const mongoose = require("mongoose");
// const validator = require('validator');

const logSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: Object.values(CheckStatus),
        message: "status is either: up or down",
      },
    },
    interval_minutes: {
      type: Number,
      default: 10,
    },
    responseTime: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now(),
    },
    check: {
      type: mongoose.Schema.ObjectId,
      ref: "Check",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
