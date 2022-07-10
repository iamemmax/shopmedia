const express = require("express")
const router = express.Router()
const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")



let {listCategories, createCategory, updateCategory,deleteCategory} = require("../../controllers/category/categories")

router.get("/", ensureLogin,  listCategories)
router.post("/create", ensureLogin, adminAccess(["super admin", "admin"]), createCategory)
router.put("/update/:id", ensureLogin, adminAccess(["super admin", "admin"]), updateCategory)
router.delete("/delete/:id", ensureLogin, adminAccess(["super admin", "admin"]), deleteCategory)
// router.put("/add-subTypes/:id", ensureLogin, adminAccess(["super admin", "admin"]), addSubCategory)

module.exports = router