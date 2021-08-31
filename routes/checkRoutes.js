const express = require("express");
const authController = require("../controllers/authController");
const checkController = require("../controllers/checkController");

const router = express.Router();

router.use(authController.protect);

// for testing only
// const data = {
//   1: "one",
// };
// router.route("/").get(async (req, res, next) => {
//   res.status(200).json({
//     status: "success",
//     data: {
//       data,
//     },
//   });
// });

router.route("/").post(checkController.createCheck);
router
  .route("/:id")
  .patch(checkController.updateCheck)
  .delete(checkController.deleteCheck);

router
  .route("/:id/set-active-state")
  .patch(checkController.setCheckActiveState);
module.exports = router;
