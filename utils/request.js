const https = require("https");
const axios = require("./axios");

const request = {
  https: async (doc) => {
    let agent;
    if (doc.ignoreSSL) {
      agent = new https.Agent({
        rejectUnauthorized: false,
      });
    }
    let response = {};
    // const timeBeforeReq = new Date().getTime();
    try {
      const res = await axios.get(doc.url, {
        httpsAgent: agent,
        headers: doc.httpHeaders,
        auth: doc.authentication,
      });
      response.statusCode = res.status;
      response.responseTime = res.duration;

      if (res.duration > doc.timeout_seconds) {
        response.status = "DOWN";
      } else if (doc.assert && doc.assert.statusCode) {
        response.status = res.status === doc.assert.statusCode ? "UP" : "DOWN";
      } else {
        response.status = res.status < 500 ? "UP" : "DOWN";
      }
    } catch (err) {
      response.statusCode = 500;
      response.status = "DOWN";
      response.responseTime = err.duration;
    }
    // let reqTime = new Date().getTime() - timeBeforeReq;
    // response.responseTime = Math.round( / 1000);
    return response;
  },
  http: async (doc) => {
    let response = {};
    // const timeBeforeReq = new Date().getTime();
    try {
      const res = await axios.get(doc.url, {
        headers: doc.httpHeaders,
        auth: doc.authentication,
      });
      response.statusCode = res.status;
      response.responseTime = res.duration;

      if (res.duration > doc.timeout_seconds) {
        response.status = "DOWN";
      } else if (doc.assert && doc.assert.statusCode) {
        response.status = res.status === doc.assert.statusCode ? "UP" : "DOWN";
      } else {
        response.status = res.status < 500 ? "UP" : "DOWN";
      }
    } catch (err) {
      response.status = 500;
      response.status = "DOWN";
      response.responseTime = err.duration;
    }

    return response;
  },
};

module.exports = request;
