const express = require("express");
const router = express.Router();

let { createUser, activateUser,  loginUser, logoutUser,forgetPassword, resetPassword,ChangePassword } = require("../controllers/Users");

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

module.exports = router;