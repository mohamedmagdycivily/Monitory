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

jest.setTimeout(30000);
describe("sign up", () => {
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
  it("GET / - success", async () => {
    const userData = {
      name: "test!!3",
      email: "maged123321as@mailsac.com",
      password: "test1234",
      passwordConfirm: "test1234",
    };

    const { body } = await request(app)
      .post("/api/v1/users/signup")
      .send(userData);

    console.log(body);
    expect(body).toEqual({
      status: "success",
      message: "Token sent to email!",
    });
  });
});
// it("POST /states - success", async () => {
//     let stateObj = {
//       state: "AL",
//       capital: "Montgomery",
//       governor: "Kay Ivey",
//     };
//     const { body } = await request(app).post("/states").send(stateObj);
//     expect(body).toEqual({
//       status: "success",
//       stateInfo: {
//         state: "AL",
//         capital: "Montgomery",
//         governor: "Kay Ivey",
//       },
//     });
//     expect(save).toHaveBeenCalledWith([
//       {
//         state: "MI",
//         capital: "Lansing",
//         governor: "Gretchen Whitmer",
//       },
//       {
//         state: "GA",
//         capital: "Atlanta",
//         governor: "Brian Kemp",
//       },
//       {
//         state: "AL",
//         capital: "Montgomery",
//         governor: "Kay Ivey",
//       },
//     ]);
//   });
// w

// describe("Checking Names", () => {
//   beforeEach(() => nameCheck());

//   test("User is Jeff", () => {
//     const user = "Jeff";
//     expect(user).toBe("Jeff");
//   });

//   test("User is Karen", () => {
//     const user = "Karen";
//     expect(user).toBe("Karen");
//   });
// });
