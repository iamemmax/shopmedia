const express  = require("express")
const router = express.Router()
const upload = require("../config/upload")

let {createAdvert, listAdverts, getSingleAdvert, updateAdvert, deleteAdver} = require("../controllers/advert/advert")


router.get("/", listAdverts)
router.post("/create",  upload.array("advertImgs", 5), createAdvert)
router.get("/:slug", getSingleAdvert)
router.put("/update/:id", upload.array("advertImgs", 5), updateAdvert)
router.delete("/delete/:id",  deleteAdver)



module.exports = router