const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, //5 minutes
  },
});
const otpModel = mongoose.model("Otp", otpSchema);
module.exports = otpModel;
