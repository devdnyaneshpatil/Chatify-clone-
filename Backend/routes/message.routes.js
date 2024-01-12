const express = require("express");
const MessageModel = require("../models/message.model");
const UserModel = require("../models/user.model");
const ChatModel = require("../models/chat.model");

const messageRouter = express.Router();

messageRouter.post("/newmessage", async (req, res) => {
  const { content, chatId } = req.body;
  if (!chatId || !content) {
    console.log("Invalid Data passed");
    return res.sendStatus(400);
  }
  var newMessage = {
    sender: req.userId,
    content,
    chat: chatId,
  };
  try {
    var message = new MessageModel(newMessage);
    message.save();
    message = await message.populate("sender", "name pic")
    message = await message.populate("chat")
    message = await UserModel.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await ChatModel.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });
    res.status(200).json({ msg: message });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

messageRouter.get("/:chatId",async(req,res)=>{
    try {
        const messages= await MessageModel.find({chat:req.params.chatId}).populate("sender","name pic email").populate('chat')
        res.status(200).json({msg:messages})
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
})

module.exports = messageRouter;
