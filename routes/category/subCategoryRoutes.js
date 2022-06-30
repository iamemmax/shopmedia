const express = require("express")
const router = express.Router()
const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")



let {createSubCategory, listSubCategories, listSubCatByCart, updateSubCart, deleteSubCategory} = require("../../controllers/category/subCategory")




// router.get("/", ensureLogin, listSubCategories)
// router.get("/:typeId", ensureLogin, listSubCatByCart)
router.post("/create/:id", ensureLogin, adminAccess(["super admin", "admin"]), createSubCategory)
router.put("/update/:id/:sub_category_id", adminAccess(["super admin", "admin"]), ensureLogin, updateSubCart)
router.delete("/delete/:id", ensureLogin, adminAccess(["super admin", "admin"]), deleteSubCategory)

module.exports = router