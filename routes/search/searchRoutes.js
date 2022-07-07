const express  = require("express")
const router = express.Router()

let {searchAdvert} = require("../../controllers/advert/advert")


router.get("/advert",  searchAdvert)
// router.get("/search",  searchBySubTypes)



module.exports = router