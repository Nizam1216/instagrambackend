const express = require("express");
const currentUser = require("./middleware/currentuser");
const {
  createStoryController,
  viewAllStoriesController,
} = require("../controllers/storyControllers");
const router = express.Router();

router.post("/create-story", currentUser, createStoryController);
router.post("/view-stories", currentUser, viewAllStoriesController);
module.exports = router;
