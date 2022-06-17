const express = require("express");
const upload = require("../../config/upload");
const { AddPages, listPages,updatePages, getSinglePage, updateLogoImg, removeAdPage,searchPages,listPagesByCategory } = require("../../controllers/Ratecard/pages");
const router = express.Router()
let ensureLogin = require("../../helper/ensureLogin")



router.get("/", ensureLogin, listPages)
router.get("/:category", ensureLogin, listPagesByCategory)
router.post("/create", ensureLogin, upload.single('pic'), AddPages)
router.get("/:page_id", ensureLogin, getSinglePage)
router.put("/update/:page_id", ensureLogin,  updatePages)
router.put("/update/img/:page_id", upload.single("pic"), ensureLogin,  updateLogoImg)
router.delete("/remove/:page_id", ensureLogin,  removeAdPage)
router.get("/search/:category", ensureLogin,  searchPages)
module.exports = router;