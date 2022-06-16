const express  = require("express")
const router = express.Router()

let {searchAdvert} = require("../../controllers/advert/advert")


router.get("/",  searchAdvert)



module.exports = router