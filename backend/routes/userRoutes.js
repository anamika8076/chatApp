const express= require('express');
const router = express.Router();
const {registerUser,authUser,allUsers }= require("../controller/userController.js")
const {protect}=require("../middleware/authMiddleware.js")

router.route("/").post(registerUser).get(protect,allUsers)
router.post("/login",authUser)


module.exports = router;