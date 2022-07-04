const express = require("express")
const router = express.Router()
let {negotiate,listMyOfer,DeleteMyOfer, compareAdvertSize} = require("../../controllers/Bussiness/negotiate")
let {listCart,addTocart, Updatecart, RemoveFromCart} = require("../../controllers/Bussiness/cart")
const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")
//@desc:negotiate
router.post("/negotiate/:id", ensureLogin, negotiate)
router.get("/myoffer/:id", ensureLogin, listMyOfer)
router.delete("/myoffer/remove/:id",  adminAccess(["super admin", "admin", "customers", "vendors"]), ensureLogin, DeleteMyOfer)

//@desc:cart
router.get("/mycart/:id", ensureLogin, listCart)
router.post("/book/:id", ensureLogin, adminAccess(["super admin", "admin", "customers", "vendors"]),  addTocart)
router.put("/book/update/:advertId",ensureLogin, adminAccess(["super admin", "admin", "customers", "vendors"]), Updatecart)
router.delete("/book/remove/:cart_id", ensureLogin, adminAccess(["super admin", "admin", "customers", "vendors"]), RemoveFromCart)

//@desc:compare advert
router.get("/compare/advert/:size", ensureLogin, compareAdvertSize)

module.exports = router 