const express = require("express")
const router = express.Router()



let {createSubCategory, updateSubCart} = require("../controllers/category/subCategory")

router.post("/:id/create", createSubCategory)
router.put("update/:id", updateSubCart)

module.exports = router