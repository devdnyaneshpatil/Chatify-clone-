const express = require("express");
const ChatModel = require("../models/chat.model");
const UserModel = require("../models/user.model");
const chatRouter = express.Router();
const auth = require("../middlewares/auth.middleware");

chatRouter.post("/createchat", auth, async (req, res) => {
  const { frdId } = req.body;

  if (!frdId) {
    res.status(400).json({ msg: "Friend id is not sent" });
    return; // Return early to prevent further execution
  }

  try {
    const isChat = await ChatModel.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.userId } } },
        { users: { $elemMatch: { $eq: frdId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    // Assuming "latestMessage" is a reference field in your ChatModel
    await ChatModel.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      res.status(200).json({ msg: isChat });
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.userId, frdId],
      };

      const createdChat = new ChatModel(chatData);
      await createdChat.save();

      const fullChat = await ChatModel.findOne({
        _id: createdChat._id,
      }).populate("users", "-password");
      res.status(200).json({ msg: fullChat });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

chatRouter.get("/", auth, async (req, res) => {
  try {
    const results = await ChatModel.find({
      users: { $elemMatch: { $eq: req.userId } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    if (results.length > 0) {
      const populatedResults = await UserModel.populate(results, {
        path: "latestMessage.sender",
        select: "name pic email",
      });
      res.status(200).json({ msg: populatedResults });
    } else {
      res.status(200).json({ msg: "No chats found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

chatRouter.post("/creategroup", auth, async (req, res) => {
  if (!req.body.users || !req.body.name) {
    res.status(201).json({ msg: "please fill all the fields" });
  }
  var users = JSON.parse(req.body.users);
  if (users.length < 2) {
    res.status(201).json({ msg: "more than 2 users required" });
  }
  try {
    users.push(req.userId);
    const groupChat = new ChatModel({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.userId,
    });
    await groupChat.save();

    const fullGroupChat = await ChatModel.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json({ msg: fullGroupChat });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

chatRouter.patch("/renamegroup", auth, async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedName = await ChatModel.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res
      .status(200)
      .json({ msg: "Chat has Been Updated", updatedChat: updatedName });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

chatRouter.patch("/addtogroup", async (req, res) => {
  const { chatId, newUserId } = req.body;
  try {
    const added = await ChatModel.findByIdAndUpdate(chatId, {
      $push: { users: newUserId },
    },{new:true}).populate("users", "-password")
      .populate("groupAdmin", "-password");
    res
      .status(200)
      .json({ msg: "user has been added", updatedChat: added });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

chatRouter.patch("/removefromgroup", async (req, res) => {
  const { chatId, newUserId } = req.body;
  try {
    const removed = await ChatModel.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: newUserId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json({ msg: "user has been removed", updatedChat: removed });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = chatRouter;
