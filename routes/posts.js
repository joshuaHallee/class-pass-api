const express = require("express");
const router = express.Router();
const verify = require("./verifyToken");
const Post = require("../models/Post");

router.get("/", verify, async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.json({ message: error });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    res.json(post);
  } catch (err) {
    res.json({ message: error });
  }
});

router.post("/", async (req, res) => {
  const post = new Post({
    title: req.body.title,
    description: req.body.description
  });

  try {
    const savedPost = await post.save();
    res.json(savedPost);
  } catch (err) {
    res.json(err);
  }
});

router.delete("/:postId", async (req, res) => {
  try {
    const deletedPost = await Post.deleteOne({ _id: req.params.postId });
    res.json(deletedPost);
  } catch (err) {
    res.json({ messaage: error });
  }
});

router.patch("/:postId", async (req, res) => {
  try {
    const updatedPost = await Post.updateOne(
      { _id: req.params.postId },
      { $set: { title: req.body.title, description: req.body.description } }
    );
    res.json(updatedPost);
  } catch (err) {
    res.json({ message: error });
  }
});

module.exports = router;
