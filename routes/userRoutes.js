const express = require("express");
const router = express.Router();
const upload = require("../config/upload")

let { createUser, activateUser,  loginUser, logoutUser,forgetPassword, resetPassword,ChangePassword, uploadProfilePic } = require("../controllers/Users");


//@desc create account
router.route("/register").post(createUser);

//@desc verify account
router.post("/verify/:id/:token", activateUser)
//@desc login account

router.route("/login").post(loginUser);

//@desc logout account
router.get("/logout", logoutUser)

//@desc forget password 
router.post("/forget-password", forgetPassword)
//@desc reset password 
router.post("/reset-password/:id/:token", resetPassword)
router.put("/change-password/:id/", ChangePassword)
router.put("/upload-profile-img/:id", upload.single("pic"), uploadProfilePic)

module.exports = router;