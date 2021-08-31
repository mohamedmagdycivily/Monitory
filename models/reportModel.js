const { CheckStatus } = require("../utils/constants");
const mongoose = require("mongoose");
// const validator = require('validator');

const reportSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: {
        values: Object.values(CheckStatus),
        message: "status is either: up or down",
      },
    },
    availability: {
      type: Number,
    },
    outages: {
      type: Number,
    },
    upNumber: {
      type: Number,
    },
    downtime: {
      type: Number,
    },
    uptime: {
      type: Number,
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

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
