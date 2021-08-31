const express = require("express");
const authController = require("../controllers/authController");
const reportController = require("../controllers/reportController");

const router = express.Router();

router.use(authController.protect);

router.route("/:id").get(reportController.getReport);

module.exports = router;
