const Chat = require("../models/chatModel.js")
const User = require("../models/userModel.js")
const mongoose = require("mongoose");
const accessChats = async (req, res) => {
    const { userId } = req.body
    if (!userId) {
        console.log("UserId param not sent with the request")
        return res.sendStatus(400)
    }
var isChat = await Chat.find({
  isgroupchat: false,
  users: {
    $all: [req.user._id, userId],
    $size: 2,
  },
}).sort({ updatedAt: -1 })
  .populate("users", "-password")
  .populate("latestMessage");
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"

    })
    if (isChat.length > 0) {
        res.send(isChat[0])
    } else {
        var chatData = {
            chatname: "sender",
            isgroupchat: false,
            users: [req.user._id, userId]
        }
        try {
            const createdChat = await Chat.create(chatData)
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password")
            res.status(200).send(FullChat)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }


}

const fetchChats = async (req, res) => {
    try {
        const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password   ")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });
        const results = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "name pic email"
        });

        // Older deployments may already contain duplicate one-to-one chats.
        // Return only the most recently updated chat for each user pair.
        const seenDirectChats = new Set();
        const uniqueResults = results.filter((chat) => {
            if (chat.isgroupchat) return true;
            const pairKey = chat.users.map((user) => user._id.toString()).sort().join(":");
            if (seenDirectChats.has(pairKey)) return false;
            seenDirectChats.add(pairKey);
            return true;
        });
        res.status(200).send(uniqueResults);
    }
    catch (error) {
        res.status(400)
        throw new Error(error.message)

    }
}
const createGroupChat = async (req, res) => {
    if (!req.body.users || !req.body.name?.trim()) {
        return res.status(400).send({ message: "Add a group name and choose people to invite." })
    }
    let users;
    try {
        users = Array.isArray(req.body.users) ? req.body.users : JSON.parse(req.body.users);
    } catch {
        return res.status(400).send({ message: "The selected people could not be read. Please select them again." });
    }
    if (!Array.isArray(users)) {
        return res.status(400).send({ message: "Please choose people from the search results." });
    }
    users = [...new Set(users.map(String).filter((id) => id !== req.user._id.toString()))];
    if (users.length < 2) {
        return res.status(400).send({ message: "A group needs at least two people besides you. For a one-to-one chat, use Search Users." });
    }
    users.push(req.user._id)
    try {
        const groupChat = await Chat.create({
            chatname: req.body.name.trim(),
            users: users,
            isgroupchat:true,
            groupAdmin: req.user
        })
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
        res.status(200).send(fullGroupChat)
    }
    catch (error) {
        res.status(400).send({ message: error.message })
    }

}
const renameGroup = async (req, res) => {
    const {chatId,chatname}=req.body
    const updatedChat=await Chat.findByIdAndUpdate(
        chatId,
        {chatname,},
        {new:true,}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password")
    if(!updatedChat){
        res.status(404)
        throw new Error("Chat Not Found")
    }
    else{
        res.json(updatedChat)
    }
}
const addToGroup=async(req,res)=>{
    const {chatId,userId}=req.body
    const added=await Chat.findByIdAndUpdate(
        chatId,
        {
            $push:{users:userId},
        },
        {new:true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password"  )
    if(!added){
        res.status(404)
        throw new Error("Chat Not Found")
    }
    else{
        res.json(added)
    }
}


const removeFromGroup=async(req,res)=>{
    const {chatId,userId}=req.body
    const removed=await Chat.findByIdAndUpdate(
        chatId,
        {
            $pull:{users:userId},
        },
        {new:true}
    )
    .populate("users","-password")
    .populate("groupAdmin","-password"  )
    if(!removed){
        res.status(404)
        throw new Error("Chat Not Found")
    }
    else{
        res.json(removed)
    }
}


module.exports = { accessChats, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup }
