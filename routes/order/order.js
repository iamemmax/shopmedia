const express = require("express")
const router = express.Router()
const {createOrder, getOrderById, updateOrderToPay, updateOrderToDeliver,getMyOrders, getTransfer, getAllOrders, getTotalRevenue} = require("../../controllers/order/order")
const { ensureLogin,adminAccess } = require("../../helper/ensureLogin")
router.get("/", ensureLogin, adminAccess(["admin", "super admin"]), getAllOrders)
router.post("/create", ensureLogin, createOrder)
router.get("/myorders", ensureLogin, getMyOrders)
router.get("/transfers", ensureLogin, adminAccess(["admin", "super admin"]), getTransfer)
router.get("/:order_id", ensureLogin, getOrderById)
router.put("/:order_id/pay", ensureLogin, updateOrderToPay)
router.put("/deliver/:order_id/pay", ensureLogin, adminAccess(["admin", "super admin"]), updateOrderToDeliver)
router.post("/revenue", ensureLogin, adminAccess(["admin", "super admin"]), getTotalRevenue)

module.exports = router