const User = require("../models/userModel");
const generateToken=require("../config/generateToken")

 
const registerUser=async(req,res)=>{
    const name=req.body.name?.trim();
    const email=req.body.email?.trim().toLowerCase();
    const {password,pic}=req.body;
    if (!name||!email||!password){
        return res.status(400).json({message:"Please enter your name, email, and password."});
    }

    try {
        const userExist=await User.findOne({email});
        if (userExist){
            return res.status(409).json({message:"An account with this email already exists. Try logging in instead."});
        }
        const user=await User.create({name,email,password,pic});
        return res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token:generateToken(user._id)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({message:"An account with this email already exists. Try logging in instead."});
        }
        console.error("User signup failed:", error.message);
        return res.status(500).json({message:"We couldn't create your account right now. Please try again."});
    }
}



const authUser=async(req,res)=>{
    const email=req.body.email?.trim().toLowerCase();
    const {password}=req.body;
    if (!email||!password){
        return res.status(400).json({message:"Enter your email and password to log in."});
    }
    const user=await User.findOne({email})
    if (user &&(await user.matchPassword(password))){
        return res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            pic:user.pic,
            token:generateToken(user._id)
        })
    }
    return res.status(401).json({message:"Email or password is incorrect. Please try again."});
}

const allUsers=async(req,res)=>{
    const keyword=req.query.search?{
        $or:[
            {name:{$regex: req.query.search,$options:"i"}},
            {email:{$regex:req.query.search,$options:"i"}}
        ],
    }
    :{}
    const users=await User.find(keyword).find({_id:{$ne:req.user._id}})
    res.send(users)
}
module.exports = {registerUser,authUser,allUsers}

