const express = require("express");
const router = express.Router();
const upload = require("../.././config/upload")
const ensureLogin = require("../.././helper/ensureLogin")

let { createUser, activateUser,  loginUser, logoutUser,forgetPassword, resetPassword,ChangePassword, uploadProfilePic } = require("../../controllers/users/Users");


//@desc create account
router.route("/register").post(createUser);

//@desc verify account
router.post("/verify/:user_id/:token", activateUser)
//@desc login account

router.route("/login").post(loginUser);

//@desc logout account
router.get("/logout", ensureLogin, logoutUser)

//@desc forget password 
router.post("/forget-password", forgetPassword)
//@desc reset password 
router.post("/reset-password/:user_id/:token", resetPassword)
router.put("/change-password/:user_id/", ensureLogin, ChangePassword)
router.put("/upload-profile-img/:user_id", ensureLogin, upload.single("pic"), uploadProfilePic)

module.exports = router;