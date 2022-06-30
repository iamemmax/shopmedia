const express  = require("express")
const router = express.Router()
const upload = require("../../config/upload")
const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")

let {createAdvert, listAdverts, getSingleAdvert, updateAdvert, deleteAdvert,updateAdvertImg,deleteAdvertImg,searchBySubTypes } = require("../../controllers/advert/advert")


router.get("/",  listAdverts)
router.post("/create", ensureLogin, adminAccess(["admin", "super admin", "vendors"]), upload.array("advertImgs", 5), createAdvert)
router.post("/search", ensureLogin,   searchBySubTypes)
router.get("/:slug",ensureLogin, getSingleAdvert)
router.put("/update/:advert_id", ensureLogin,  adminAccess(["admin", "super admin"]), updateAdvert)
router.put("/update/img/:advert_id", ensureLogin,  adminAccess(["admin", "super admin", "vendors"]), upload.array("advertImgs", 5), updateAdvertImg)
router.delete("/delete/:advert_id", ensureLogin,  adminAccess(["admin", "super admin"]),  deleteAdvert)
router.delete("/delete/img/:advert_id", ensureLogin,  adminAccess(["admin", "super admin"]),  deleteAdvertImg)


module.exports = router