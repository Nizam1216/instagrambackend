const express = require("express");
const currentUser = require("./middleware/currentuser");
const {
  createPostController,
  usersPostsController,
  allPostsController,
  likePost,
  unlikePost,
  likeComment,
  addComment,
  unlikeComment,
  replyToComment,
  likeReply,
  unlikeReply,
} = require("../controllers/postControllers");
const router = express.Router();

router.post("/create-post", currentUser, createPostController);
router.post("/:postId/like", currentUser, likePost);
router.post("/:postId/unlike", currentUser, unlikePost);
// Comment routes
router.post("/:postId/comments", currentUser, addComment);
router.post("/:postId/comments/:commentId/like", currentUser, likeComment);
router.post("/:postId/comments/:commentId/unlike", currentUser, unlikeComment);
router.post(
  "/:postId/comments/:commentId/replies",
  currentUser,
  replyToComment
);

// Reply routes
router.post(
  "/:postId/comments/:commentId/replies/:replyId/like",
  currentUser,
  likeReply
);
router.post(
  "/posts/:postId/comments/:commentId/replies/:replyId/unlike",
  currentUser,
  unlikeReply
);
router.post("/user-posts", currentUser, usersPostsController);
router.post("/all-posts", allPostsController);
module.exports = router;
