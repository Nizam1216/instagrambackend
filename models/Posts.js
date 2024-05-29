const mongoose = require("mongoose");
const CommentsModel = require("./CommentsModel");

const postsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    caption: {
      type: String,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Add this field
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const postsModel = mongoose.model("Post", postsSchema);

module.exports = postsModel;
