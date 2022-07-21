const express  = require("express")
const router = express.Router()
const upload = require("../../config/upload")
const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")

let {createAdvert, listAdverts, searchAdvert, searchAdvertQuery,  getSingleAdvert, updateAdvert, deleteAdvert,updateAdvertImg, updateEachImg, deleteAdvertImg } = require("../../controllers/advert/advert")


router.route("/").get(listAdverts).get(searchAdvert)
router.post("/create", ensureLogin, adminAccess(["admin", "super admin", "vendors"]), upload.array("advertImgs", 5), createAdvert)
router.get("/search", ensureLogin,   searchAdvertQuery)
router.get("/:slug", getSingleAdvert)
router.put("/update/:advert_id", ensureLogin,  adminAccess(["admin", "super admin"]), updateAdvert)
router.put("/update/img/:advert_id", ensureLogin,  adminAccess(["admin", "super admin", "vendors"]), upload.array("advertImgs", 5), updateAdvertImg)
router.put("/update/single-img/:advert_id", ensureLogin,  adminAccess(["admin", "super admin", "vendors"]), upload.single("advertImgs"), updateEachImg)
router.delete("/delete/:advert_id", ensureLogin,  adminAccess(["admin", "super admin"]),  deleteAdvert)
router.delete("/delete/img/:advert_id", ensureLogin,  adminAccess(["admin", "super admin"]),  deleteAdvertImg)


module.exports = router