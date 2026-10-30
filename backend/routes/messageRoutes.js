const express = require('express')
const { protect } = require('../middleware/authMiddleware')
const {sendMessage,allMessages,markChatRead}=require("../controller/messageController.js")

const router=express.Router()
router.route('/').post(protect,sendMessage)
router.route('/:chatId/read').put(protect,markChatRead)
router.route('/:chatId').get(protect,allMessages)
module.exports=router
