const express = require("express");
const router = express.Router();

let { createUser, activateUser,  loginUser, logoutUser,forgetPassword } = require("../controllers/Users");

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

module.exports = router;