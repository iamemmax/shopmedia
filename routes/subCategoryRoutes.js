const express = require("express")
const router = express.Router()



let {createSubCategory, listSubCategories, listSubCatByCart} = require("../controllers/category/subCategory")

router.get("/", listSubCategories)
router.get("/:typeId", listSubCatByCart)
router.post("/:id/create", createSubCategory)

module.exports = router