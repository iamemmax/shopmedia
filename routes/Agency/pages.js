const express = require("express");
const upload = require("../../config/upload");
const { AddPages, listPages,updatePages, getSinglePage, updateLogoImg, removeAdPage,searchAgency,listPagesByCategory, updateStatus } = require("../../controllers/Agency/pages");
const router = express.Router()
let {ensureLogin, adminAccess} = require("../../helper/ensureLogin")



router.post("/create", ensureLogin,  adminAccess(["admin", "super admin"]), upload.single('logo'), AddPages)
router.get("/", ensureLogin, listPages)
router.get("/s", ensureLogin,  searchAgency)
router.get("/list/:categoryId", ensureLogin, listPagesByCategory)
router.put("/update/:page_id", ensureLogin,   adminAccess(["admin", "super admin"]), updatePages)
router.put("/update/img/:page_id",  ensureLogin,  adminAccess(["admin", "super admin"]),  upload.single("logo"), updateLogoImg)
router.delete("/remove/:page_id", ensureLogin, adminAccess(["admin", "super admin"]), removeAdPage)
router.put("/update/status/:page_id", ensureLogin,  adminAccess(["admin", "super admin"]), updateStatus)
router.get("/:page_id", ensureLogin, getSinglePage)
module.exports = router;