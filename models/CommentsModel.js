const mongoose = require("mongoose");
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
    },
    fullname: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },

    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const CommentsModel = mongoose.model("Comment", commentSchema);

module.exports = CommentsModel;
