const express = require("express")
const router = express.Router()
const ensureLogin = require("../../helper/ensureLogin")



let {listCategories, createCategory, updateCategory,deleteCategory, addSubCategory} = require("../../controllers/category/categories")

router.get("/", ensureLogin, listCategories)
router.post("/create", ensureLogin, createCategory)
router.put("/update/:id", ensureLogin, updateCategory)
router.delete("/delete/:id", ensureLogin, deleteCategory)
router.put("/add-subTypes/:id", ensureLogin, addSubCategory)

module.exports = router