const express = require("express");
const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const {generateToken} = require("../config/generateToken");
const auth=require("../middlewares/auth.middleware")

const userRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 * 
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         pic:
 *           type: string
 * 
 *     UserResponse:
 *       type: object
 *       properties:
 *         msg:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: New user has been added successfully
 *         content:
 *           application/json:
 *             example:
 *               msg: new user has been added
 *               newUser:
 *                 $ref: '#/components/schemas/User'
 *               token:
 *                 type: string
 *       201:
 *         description: User already exists
 *         content:
 *           application/json:
 *             example:
 *               msg: user already exist
 *       400:
 *         description: Bad request or error in registration
 *         content:
 *           application/json:
 *             example:
 *               error: Error message
 */


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


/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login with existing user credentials
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCredentials'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               msg: Login Successful
 *               user:
 *                 $ref: '#/components/schemas/User'
 *               token:
 *                 type: string
 *       201:
 *         description: Incorrect password or user not found
 *         content:
 *           application/json:
 *             example:
 *               msg: please check your password or user not found
 *       400:
 *         description: Bad request or error in login
 *         content:
 *           application/json:
 *             example:
 *               error: Error message
 */

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

userRouter.get("/",auth,async(req,res)=>{
    const keyword=req.query.search?{
        $or:[
            {
                name:{$regex:req.query.search, $options:"i"},
                email:{$regex:req.query.search, $options:"i"},
            }
        ]
    }:{}
    const users=await UserModel.find(keyword).find({_id:{$ne:req.userId}})
    res.send(users)
})

module.exports = userRouter;
