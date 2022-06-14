const express = require("express")
const router = express.Router()



let {createSubCategory} = require("../controllers/category/subCategory")

router.post("/create", createSubCategory)

module.exports = router