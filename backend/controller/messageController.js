const Chat = require("../models/chatModel")
const  Message=require("../models/messageModel")
const  User=require("../models/userModel")

const sendMessage=async(req,res)=>{
    const {content,chatId}=req.body
    if (!content||!chatId){
        console.log("invalid data passed into request")
        return res.sendStatus(400)

    }
    var newMessage={
        sender:req.user._id,
        content:content,
        chat:chatId,
    }
    try {
        var message=await Message.create(newMessage)
        message=await message.populate("sender","name pic")
        message=await message.populate("chat")

        message=await User.populate(message,{
            path:"chat.users",
            select:"name pic email"
        })
        const unreadIncrements = {};
        message.chat.users.forEach((member) => {
            const memberId = member._id.toString();
            if (memberId !== req.user._id.toString()) {
                unreadIncrements[`unreadCounts.${memberId}`] = 1;
            }
        });
        await Chat.findByIdAndUpdate(req.body.chatId,{
            $set: { latestMessage: message._id },
            $inc: unreadIncrements,
        })
        res.json(message)
        
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
}
const allMessages=async(req,res)=>{
    try {
        const messages=await Message.find({chat:req.params.chatId})
        .populate("sender","name pic email")
        .populate("chat")

        await Chat.findOneAndUpdate(
            { _id: req.params.chatId, users: req.user._id },
            { $set: { [`unreadCounts.${req.user._id.toString()}`]: 0 } }
        );

        res.json(messages)
        
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
        
    }
}
const markChatRead=async(req,res)=>{
    try {
        const chat=await Chat.findOneAndUpdate(
            { _id: req.params.chatId, users: req.user._id },
            { $set: { [`unreadCounts.${req.user._id.toString()}`]: 0 } },
            { new: true }
        );
        if (!chat) return res.status(404).json({message:"Chat not found."});
        return res.json({success:true});
    } catch (error) {
        return res.status(400).json({message:error.message});
    }
}
module.exports={sendMessage,allMessages,markChatRead}
