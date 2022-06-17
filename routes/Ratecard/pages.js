const express = require("express");
const upload = require("../../config/upload");
const { AddPages, listPages,updatePages, getSinglePage } = require("../../controllers/Ratecard/pages");
const router = express.Router()
let ensureLogin = require("../../helper/ensureLogin")



router.get("/", ensureLogin, listPages,)
router.post("/create", ensureLogin, upload.single('pic'), AddPages)
router.get("/:page_id", ensureLogin, getSinglePage)
router.put("/update/:page_id", ensureLogin,  upload.single('pic'), updatePages)
module.exports = router;