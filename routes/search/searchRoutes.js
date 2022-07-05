const express  = require("express")
const router = express.Router()

let {searchAdvert, searchAdvertQuery} = require("../../controllers/advert/advert")


router.get("/advert",  searchAdvertQuery)
// router.get("/search",  searchBySubTypes)



module.exports = router