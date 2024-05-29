const postsModel = require("../models/Posts");
const userModel = require("../models/UserModel");
const CommentsModel = require("../models/CommentsModel");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  timeout: 60000,
});
exports.createPostController = async (req, res) => {
  try {
    const { post, caption } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .send({ error: "Action revoked please login first" });
    }

    const result = await cloudinary.uploader.upload(post, {
      public_id: "post",
      folder: "posts",
    });

    const newPost = await postsModel.create({
      post: {
        public_id: result.public_id,
        url: result.secure_url,
      },
      caption,
      user: req.user.id,
    });

    res.send(newPost);
  } catch (error) {
    console.log(error);
    res.json({ error: error.message });
  }
};
exports.allPostsController = async (req, res) => {
  try {
    // Fetch all posts
    const allPosts = await postsModel
      .find()
      .populate({
        path: "user",
        select: "username fullname profilePic",
        strictPopulate: false,
      })
      .populate({
        path: "comments",
        select: "username text likes replies profilePic",
        strictPopulate: false,
      })
      .populate({
        path: "likedBy",
        select: "username fullname profilePic",
      });
    // Return all posts
    res.status(200).json(allPosts);
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
};

exports.likePost = async (req, res) => {
  const userId = req.user.id; // Assuming the user ID is passed in the request body
  try {
    const post = await postsModel.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ error: "User has already liked this post" });
    }

    post.likes += 1;
    post.likedBy.push(userId);
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unlikePost = async (req, res) => {
  const userId = req.user.id; // Assuming the user ID is passed in the request body
  try {
    const post = await postsModel.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userIndex = post.likedBy.indexOf(userId);
    if (userIndex === -1) {
      return res.status(400).json({ error: "User has not liked this post" });
    }

    post.likes -= 1;
    post.likedBy.splice(userIndex, 1); // Remove the user ID from the likedBy array
    await post.save();

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//comments controllers

exports.addComment = async (req, res) => {
  try {
    const { text, username, fullname, profilePic } = req.body;
    const comment = new CommentsModel({ text, username, fullname, profilePic });
    await comment.save();

    const post = await postsModel.findById(req.params.postId);
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.likeComment = async (req, res) => {
  try {
    const comment = await CommentsModel.findByIdAndUpdate(
      req.params.commentId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.unlikeComment = async (req, res) => {
  try {
    const comment = await CommentsModel.findByIdAndUpdate(
      req.params.commentId,
      { $inc: { likes: -1 } },
      { new: true }
    );
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.replyToComment = async (req, res) => {
  try {
    const { text, username } = req.body;
    const reply = new CommentsModel({ text, username });
    await reply.save();

    const comment = await CommentsModel.findById(req.params.commentId);
    comment.replies.push(reply);
    await comment.save();

    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.likeReply = async (req, res) => {
  try {
    const reply = await CommentsModel.findByIdAndUpdate(
      req.params.replyId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.unlikeReply = async (req, res) => {
  try {
    const reply = await CommentsModel.findByIdAndUpdate(
      req.params.replyId,
      { $inc: { likes: -1 } },
      { new: true }
    );
    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//posts controllers
exports.usersPostsController = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Find the user by ID
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch all posts by the user
    const userPosts = await postsModel
      .find({ user: req.user.id })
      .populate("comments");

    // Return the user's posts
    res.status(200).json(userPosts);
  } catch (error) {
    console.log(error);
    res.send("internal server error");
  }
};
