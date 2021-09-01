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
  let token;

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

      console.log(body);
      token = body.token;
      expect(body.status).toEqual("success");
    });
  });
});
