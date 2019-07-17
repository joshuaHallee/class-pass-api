const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res) => {
  //validate
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check for existing email
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email already exists");

  //little bit of hash(browns) and salt because im hungry
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashPassword
  });

  try {
    const savedUser = await user.save();
    res.json({ user: user._id });
  } catch (err) {
    res.json(err);
  }
});

router.post("/login", async (req, res) => {
  //validate
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check for existing email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Email is incorrect");

  //password check
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Password is incorrect");

  //create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send(token);
});

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.json(err);
  }
});

router.delete("/:userId", async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.userId });
    res.json(deletedUser);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
