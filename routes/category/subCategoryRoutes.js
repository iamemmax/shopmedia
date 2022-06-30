const express = require("express")
const router = express.Router()
const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")



let {createSubCategory,  listSubCategories, updateSubCart, deleteSubCategory} = require("../../controllers/category/subCategory")




// router.get("/", ensureLogin, listSubCategories)
router.get("/:categoryId", ensureLogin, listSubCategories)
router.post("/create/:id", ensureLogin, adminAccess(["super admin", "admin"]), createSubCategory)
router.put("/update/:sub_category_id",  ensureLogin, adminAccess(["super admin", "admin"]), updateSubCart)
router.delete("/delete/:sub_category_id", ensureLogin, adminAccess(["super admin", "admin"]), deleteSubCategory)

module.exports = router