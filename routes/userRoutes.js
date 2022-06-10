const express = require("express");
const router = express.Router();

let { createUser, activateUser } = require("../controllers/Users");

//@desc create account
router.route("/register").post(createUser);

//@desc verify account
router.post("/verify/:id/:token", activateUser)

module.exports = router;