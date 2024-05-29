const storiesModel = require("../models/StoriesModel");
const userModel = require("../models/UserModel");

exports.createStoryController = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.send("user not found");
    }
    const { story } = req.body;
    const newStory = await storiesModel.create({
      user: userId,
      story,
      username: user.username,
      profilePic: user.profilePic.url,
    });
    res.json({ newStory });
  } catch (error) {
    res.json({ error: error });
  }
};
exports.viewAllStoriesController = async (req, res) => {
  try {
    const allStories = await storiesModel.find();
    res.json({ allStories });
  } catch (error) {}
};
