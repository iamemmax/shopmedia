const express = require("express")
const router = express.Router()
const {createOrder, getOrderById, updateOrderToPay, updateOrderToDeliver,getMyOrders} = require("../../controllers/order/order")
const { ensureLogin,adminAccess } = require("../../helper/ensureLogin")
router.post("/create", ensureLogin, createOrder)
router.get("/myorders", ensureLogin, getMyOrders)
router.get("/:order_id", ensureLogin, getOrderById)
router.put("/:order_id/pay", ensureLogin, updateOrderToPay)
router.put("/deliver/:order_id/pay", ensureLogin, adminAccess(["admin", "super admin"]), updateOrderToDeliver)

module.exports = router