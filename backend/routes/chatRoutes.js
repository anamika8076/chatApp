const express=require('express');
const {protect}=require("../middleware/authMiddleware.js")
const router = express.Router();
const {accessChats,fetchChats,createGroupChat,renameGroup,removeFromGroup,addToGroup}=require("../controller/chatController.js")


router.route("/").post(protect,accessChats)
router.route("/").get(protect,fetchChats)
router.route("/group").post(protect,createGroupChat)
router.route("/rename").put(protect,renameGroup)
router.route("/groupremove").put(protect,removeFromGroup)
router.route("/groupadd").put(protect,addToGroup)


module.exports = router;