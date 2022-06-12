const express = require("express")
const router = express.Router()



let {listCategories,createCategory, updateCategory,deleteCategory, addSubCategory} = require("../controllers/categories")

router.get("/", listCategories)
router.post("/create", createCategory)
router.put("/update/:id", updateCategory)
router.delete("/delete/:id", deleteCategory)
router.put("/add-subTypes/:id", addSubCategory)

module.exports = router