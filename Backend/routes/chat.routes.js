const express=require("express")
const ChatModel = require("../models/chat.model")
const UserModel=require("../models/user.model")
const chatRouter=express.Router()

chatRouter.post("/createchat",async(req,res)=>{
    const {frdId}=req.body
    if(!frdId){
        res.status(201).json({msg:"friend id is not sent"})
    }
    try {
        var isChat=await ChatModel.find({
            isGroupChat:false,
            $and:[
                {users:{$eleMatch:{$eq:req.userId}}},
                {users:{$eleMatch:{$eq:req.frdId}}}
            ]
        }).populate("users","-password").populate("latestMessage")
        isChat=await UserModel.populate(isChat,{
            path:'latestMessage.sender',
            select:'name pic email'
        })
        if(isChat){
            res.status(200).json({msg:isChat})
        }else{
           chatData={
            chatName:"sender",
            isGroupChat:false,
            users:[req.userId,frdId]
           }
           const createdChat=await ChatModel.create(chatData)
           const fullChat=await ChatModel.findOne({_id:createdChat._id}).populate("user",'-password')
           res.status(200).json({msg:fullChat})
        }
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})

module.exports=chatRouter