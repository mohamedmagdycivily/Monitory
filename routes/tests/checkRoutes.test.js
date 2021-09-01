const express = require("express"); // import express
const request = require("supertest"); // supertest is a framework that allows to easily test web
const mongoose = require("mongoose"); // supertest is a framework that allows to easily test web

const userRouter = require("../userRoutes"); //import file we are testing
const checkRouter = require("../checkRoutes"); //import file we are testing
const reportRouter = require("../reportRoute"); //import file we are testing
const User = require("../../models/userModel");
const Check = require("../../models/userModel");
const Report = require("../../models/userModel");
const Log = require("../../models/userModel");

const app = require("../../app"); //an instance of an express app, a 'fake' express app
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// jest.setTimeout(30000);
describe("Testing", () => {
  // beforeEach(async () => {
  //   await User.deleteMany();
  // });
  beforeAll(async () => {
    await mongoose
      .connect(process.env.DATABASE_LOCAL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      })
      .then(() => console.log("DB connection is successful"));
  });
  let token, checkId;

  describe("userRoutes", () => {
    it("sign up", async () => {
      const userData = {
        name: "test1",
        email: "test1@mailsac.com",
        password: "test1234",
        passwordConfirm: "test1234",
      };

      const { body } = await request(app)
        .post("/api/v1/users/signup")
        .send(userData);

      expect(body).toEqual({
        status: "success",
        message: "Token sent to email!",
      });
    });

    it("activate user", async () => {
      let user = await User.findOne({ email: "test1@mailsac.com" });

      let passwordActivateToken = user.passwordActivateToken;

      const { body } = await request(app).patch(
        `/api/v1/users/activateAccount/${passwordActivateToken}`
      );

      token = body.token;
      expect(body.status).toEqual("success");
    });

    it("log in", async () => {
      const { body } = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "test1@mailsac.com",
          password: "test1234",
        })
        .set("Authorization", "Bearer " + token);

      token = body.token;
      expect(body.status).toEqual("success");
    });
  });

  describe("checkRoutes", () => {
    it("create check", async () => {
      const checkData = {
        name: "test check",
        url: "https://www.facebook.com/",
        protocol: "https",
        port: 443,
        timeout_seconds: 10,
        interval_minutes: 1,
        threshold: 1,
        authentication: {
          username: "mohamed magdy",
          password: "test1234",
        },
        httpHeaders: {},
        assert: {},
        tags: ["red"],
        ignoreSSL: true,
      };

      const { body } = await request(app)
        .post("/api/v1/checks")
        .send(checkData)
        .set("Authorization", "Bearer " + token);

      checkId = body.data.data._id;

      expect(body.status).toEqual("success");
    });

    it("update check", async () => {
      const checkData = {
        name: "test check",
        url: "https://www.facebook.com/",
        protocol: "https",
        port: 443,
        timeout_seconds: 10,
        interval_minutes: 1,
        threshold: 1,
        authentication: {
          username: "mohamed magdy",
          password: "test1234",
        },
        httpHeaders: {},
        assert: {},
        tags: ["red"],
        ignoreSSL: true,
      };

      const { body } = await request(app)
        .patch(`/api/v1/checks/${checkId}`)
        .send({
          name: "test updated",
        })
        .set("Authorization", "Bearer " + token);

      expect(body.status).toEqual("success");
      expect(body.data.data.name).toEqual("test updated");
    });
  });

  describe("reportRoutes", () => {
    console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");

    it("get report", async () => {
      console.log(`api/v1/reports/${checkId}?page=1&limit=5`);
      console.log({ checkId });
      const { body } = await request(app)
        .get(`/api/v1/reports/${checkId}?page=1&limit=5`)
        .set("Authorization", "Bearer " + token);
      console.log(body);

      expect(body.message).toEqual(
        "there is no report please wait for 10 minutes and check again "
      );
    });
  });

  describe("checkRoutes : delete check", () => {
    it("delete check", async () => {
      const { body } = await request(app)
        .delete(`/api/v1/checks/${checkId}`)
        .set("Authorization", "Bearer " + token);

      expect(body.status).toEqual("success");
    });
  });
});
