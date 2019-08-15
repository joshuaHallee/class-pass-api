const express = require("express");
const router = express.Router();
const User = require("../models/User");
const verify = require("./verifyToken");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const client = require("twilio")(
  process.env.TWILIO_ACCOUT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
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
    name: {
      first: req.body.name.first,
      last: req.body.name.last
    },
    role: {
      isTeacher: req.body.role.isTeacher,
      isStudent: req.body.role.isStudent,
      isParent: req.body.role.isParent
    },
    phone: req.body.phone,
    email: req.body.email,
    password: hashPassword
  });

  try {
    //res.json(req.body);
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
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "2h"
  });

  res.header("auth-token", token).send(token);
});

//phone verification
router.post("/verify-phone", (req, res) => {
  res.header("Content-Type", "application/json");
  client.messages
    .create({
      from: process.env.TWILIO_PHONE_NUMBER,
      to: req.body.to,
      body: req.body.body
    })
    .then(() => {
      res.send(JSON.stringify({ success: true }));
    })
    .catch(err => {
      console.log(err);
      res.send(JSON.stringify({ success: false }));
    });
});

router.get("/", verify, async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.json(err);
  }
});

router.delete("/:userId", verify, async (req, res) => {
  try {
    const deletedUser = await User.deleteOne({ _id: req.params.userId });
    res.json(deletedUser);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
