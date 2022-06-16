const express = require("express")
const router = express.Router()
const ensureLogin = require("../../helper/ensureLogin")



let {createSubCategory, listSubCategories, listSubCatByCart, updateSubCart, deleteSubCategory} = require("../../controllers/category/subCategory")




router.get("/", ensureLogin, listSubCategories)
router.get("/:typeId", ensureLogin, listSubCatByCart)
router.post("/:id/create", ensureLogin, createSubCategory)
router.put("/update/:id", ensureLogin, updateSubCart)
router.delete("/delete/:id", ensureLogin, deleteSubCategory)

module.exports = router