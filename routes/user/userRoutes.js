const express = require("express");
const router = express.Router();
const upload = require("../.././config/upload")
const {ensureLogin, adminAccess} = require("../.././helper/ensureLogin")

let { createUser, activateUser, searchAllUser, loginUser, logoutUser, emailSubcriber, forgetPassword, resetPassword,ChangePassword, updateProfile, uploadProfilePic, listUsers, removeUsers, createAdmin , removeMultipleUsers} = require("../../controllers/users/Users");

//@desc create account
router.get("/", ensureLogin, adminAccess(["super admin", "admin"]),listUsers)
router.get("/search", ensureLogin, adminAccess(["super admin", "admin"]),searchAllUser)
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
router.put("/change-password/:user_id", ensureLogin, adminAccess(["super admin", "admin", "customers", "vendors"]), ChangePassword)
router.put("/profile/update/:user_id", ensureLogin, adminAccess(["super admin", "admin", "customers", "vendors"]), updateProfile)
router.put("/upload-profile-img/:user_id", ensureLogin,  adminAccess(["super admin", "admin", "customers", "vendors"]), upload.single("pic"), uploadProfilePic)
router.delete("/remove/:user_id", ensureLogin, adminAccess(["super admin", "admin"]), removeUsers)
router.delete("/remove/multiple_users", ensureLogin, adminAccess(["super admin", "admin"]), removeMultipleUsers)
// @desc: Admin
router.put("/create-admin/:user_id", ensureLogin, adminAccess(["super admin"]), createAdmin)
router.put("/subcribe", ensureLogin, emailSubcriber)
// router.put("/remove-admin/:user_id", ensureLogin, adminAccess(["super admin"]), removeAdminAcct)

module.exports = router;