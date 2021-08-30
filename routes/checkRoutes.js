const express = require("express");
const authController = require("../controllers/authController");
const checkController = require("../controllers/checkController");

const router = express.Router();

router.use(authController.protect);

router.route("/").post(checkController.createCheck);
router
  .route("/:id")
  .patch(checkController.updateCheck)
  .delete(checkController.deleteCheck);

router.route("/pause/:id").patch(checkController.pause);
module.exports = router;
