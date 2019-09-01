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
  if (error) return res.json(error.details[0].message);

  //check for existing email
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.json({ error: "Email already exists" });

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
    const savedUser = await user.save();

    //create and assign a token
    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "2h"
    });

    res
      .status(200)
      .header("auth-token", token)
      .send(token);
  } catch (err) {
    res.json(err);
  }
});

router.post("/login", async (req, res) => {
  //validate
  const { error } = loginValidation(req.body);
  if (error) return res.json(error.details[0].message);

  //check for existing email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.json({ error: "Email is incorrect" });

  //password check
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.json({ error: "Password is incorrect" });

  //create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: "2h"
  });

  res
    .status(200)
    .header("auth-token", token)
    .send(token);
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

router.get("/:userId", verify, async (req, res) => {
  try {
    const findUserById = await User.find({
      _id: req.params.userId
    });
    res.json(findUserById);
  } catch (err) {
    res.json(err);
  }
});

router.put("/:userId", verify, async (req, res) => {
  const userId = req.params.userId;

  let mods = {
    // name: {
    //   first: req.body.name.first,
    //   last: req.body.name.last
    // },
    // phone: req.body.phone,
    // email: req.body.email
  };
  Object.keys(req.body).forEach((key, index) => {
    console.log(key);
    if(req.body[key] !== null && req.body[key] !== undefined && req.body[key] !== ''){
      if(key === "name"){
        if(req.body.name.first !== null && req.body.name.first !== undefined && req.body.name.first !== ''){
          mods.name = {first: req.body.name.first};
        }else{
          mods.name = {};
        }
        if(req.body.name.last !== null && req.body.name.last !== undefined && req.body.name.last !== '') {
          mods.name.last = req.body.name.last;
        }
      }else {
        mods[key] = req.body[key];
      }
    }
  });
  User.update({_id: userId}, mods, (errors, raw) => {
    if(errors) console.log(errors);
    else res.json(raw);
  })
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
