const express = require("express");
const upload = require("../../config/upload");
const { AddPages, listPages,updatePages, getSinglePage, updateLogoImg, removeAdPage,searchPages,listPagesByCategory } = require("../../controllers/Agency/pages");
const router = express.Router()
let {ensureLogin, adminAccess} = require("../../helper/ensureLogin")



router.get("/", ensureLogin, listPages)
router.get("/:category", ensureLogin, listPagesByCategory)
router.post("/create", ensureLogin,  adminAccess(["admin", "super admin"]), upload.single('logo'), AddPages)
router.get("/:page_id", ensureLogin, getSinglePage)
router.put("/update/:page_id", ensureLogin,   adminAccess(["admin", "super admin"]), updatePages)
router.put("/update/img/:page_id",  ensureLogin,  adminAccess(["admin", "super admin"]),  upload.single("logo"), updateLogoImg)
router.delete("/remove/:page_id", ensureLogin, adminAccess(["admin", "super admin"]), removeAdPage)
router.get("/search/:category", ensureLogin,  searchPages)
module.exports = router;