const https = require("https");
const net = require("net");
const axios = require("./axios");

function getHttpRequester(secure = false) {
  return async (doc) => {
    let agent;
    if (secure) {
      if (doc.ignoreSSL) {
        agent = new https.Agent({
          rejectUnauthorized: false,
        });
      }
    }
    let response = {};
    // const timeBeforeReq = new Date().getTime();
    try {
      let url = new URL(doc.url);
      if (doc.path) {
        url.pathname = doc.path;
      }
      // if (doc.port) {
      //   url.port = doc.port;
      // }
      url.protocol = doc.protocol;

      const res = await axios.get(url.toString(), {
        httpsAgent: agent,
        headers: doc.httpHeaders,
        auth: doc.authentication,
        timeout: doc.timeout_seconds * 1000,
      });
      response.statusCode = res.status;
      response.responseTime = res.duration;
      console.log("response.statusCode = ", response.statusCode);
      if (doc.assert && doc.assert.statusCode) {
        response.status = res.status === doc.assert.statusCode ? "UP" : "DOWN";
      } else {
        response.status = res.status < 500 ? "UP" : "DOWN";
      }
    } catch (err) {
      response.statusCode = 500;
      response.status = "DOWN";
      response.responseTime = err.duration;
    }
    return response;
  };
}

function requestTcp(doc) {
  return new Promise((resolve, reject) => {
    const url = new URL(doc.url);
    net.connect(url.port, url.hostname, function (err) {
      if (err) {
        //down logic
        return reject();
      }
      //Up logic
      return resolve();
    });
  });
}
const request = {
  https: getHttpRequester(true),
  http: getHttpRequester(),
  tcp: requestTcp,
};

module.exports = request;
