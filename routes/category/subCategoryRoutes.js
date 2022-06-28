const express = require("express")
const router = express.Router()
const ensureLogin = require("../../helper/ensureLogin")



let {createSubCategory, listSubCategories, listSubCatByCart, updateSubCart, deleteSubCategory} = require("../../controllers/category/subCategory")




// router.get("/", ensureLogin, listSubCategories)
// router.get("/:typeId", ensureLogin, listSubCatByCart)
router.post("/create/:id", ensureLogin, createSubCategory)
router.put("/update/:id/:sub_category_id", ensureLogin, updateSubCart)
router.delete("/delete/:id", ensureLogin, deleteSubCategory)

module.exports = router