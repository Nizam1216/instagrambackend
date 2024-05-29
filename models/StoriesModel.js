const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  story: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    experies: 86400,
  },
});
const storiesModel = new mongoose.model("Story", storySchema);
module.exports = storiesModel;
