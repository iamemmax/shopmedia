const express = require("express")
const router = express.Router()
let {negotiate,listMyOfer,DeleteMyOfer} = require("../../controllers/Bussiness/negotiate")
let {listCart,addTocart, Updatecart, RemoveFromCart} = require("../../controllers/Bussiness/cart")
//@desc:negotiate
router.post("/negotiate/:id", negotiate)
router.get("/myoffer/:id", listMyOfer)
router.delete("/myoffer/remove/:id", DeleteMyOfer)

//@desc:cart
router.get("/mycart/:id", listCart)
router.post("/book/:id", addTocart)
router.put("/book/update/:id", Updatecart)
router.delete("/book/remove/:cart_id", RemoveFromCart)


module.exports = router