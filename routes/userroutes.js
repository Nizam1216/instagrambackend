const express = require("express");
const currentUser = require("./middleware/currentuser");
const router = express.Router();
const {
  signupController,
  loginController,
  userController,
  allUsersController,
  updateUserController,
  deleteUserController,
  sendMailController,
  validateOtpController,
  otpForgotPasswordController,
  forgotPasswordController,
} = require("../controllers/userControllers");

router.post("/signup", signupController);
router.post("/otp", sendMailController);
router.post("/validate-otp", validateOtpController);
router.post("/signin", loginController);
router.get("/user", currentUser, userController);
router.post("/update-user", currentUser, updateUserController);
router.post("/delete-user", currentUser, deleteUserController);
router.post("/allusers", allUsersController);
router.post("/forgot-password-otp", otpForgotPasswordController);
router.post("/forgot-password", forgotPasswordController);
module.exports = router;
