const express = require("express");
const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const generateToken = require("../config/generateToken");

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ msg: "please fill all the fields" });
  }
  try {
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      res.status(201).json({ msg: "user already exist" });
    } else {
      bcrypt.hash(password, 2, async (err, hash) => {
        // Store hash in your password DB.
        if (err) {
          res.status(400).json({ error: err.message });
        } else {
          const newUser = new UserModel({ name, email, password: hash, pic });
          await newUser.save();
          console.log(newUser);
          res
            .status(200)
            .json({
              msg: "new user has been added",
              newUser,
              token: generateToken(newUser._id),
            });
        }
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ msg: "please fill Your credentials" });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (user) {
      bcrypt.compare(password, user.password, function (err, result) {
        // result == true
        if (result) {
          res.status(200).json({
            msg: "Login Successfull",
            user,
            token: generateToken(user._id),
          });
        } else {
          res.status(201).json({ msg: "please check your password" });
        }
      });
    } else {
      res.status(201).json({ msg: "please register first" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = userRouter;
