const mongoose = require("mongoose");
// const validator = require('validator');
const authenticationSchema = new mongoose.Schema({
  username: { type: String },
  password: { type: String },
});

const checkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A check must have a name"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "A check must have a url"],
    },
    protocol: {
      type: String,
      required: [true, "A check must have a difficulty"],
      enum: {
        values: ["http", "https", "tcp"],
        message: "protocol is either: http, https, tcp",
      },
    },
    path: {
      type: String,
    },
    port: {
      type: Number,
    },
    webhook: {
      type: String,
    },
    timeout_seconds: {
      type: Number,
      default: 5,
    },
    interval_minutes: {
      type: Number,
      default: 10,
    },
    threshold: {
      type: Number,
      default: 1,
    },
    authentication: {
      username: { type: String },
      password: { type: String },
    },
    httpHeaders: {
      type: Map,
      of: String,
    },
    assert: {
      statusCode: { type: Number },
    },
    tags: [String],
    ignoreSSL: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Check must belong to a user"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

checkSchema.pre("save", function (next) {
  next();
});

checkSchema.index({ name: 1, user: 1 }, { unique: true });

const Check = mongoose.model("Check", checkSchema);

module.exports = Check;
