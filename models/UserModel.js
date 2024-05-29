const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
  },
  profilePic: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  date: {
    type: String,
    default: Date.now,
  },
});
const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
