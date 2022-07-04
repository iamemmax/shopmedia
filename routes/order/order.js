const express = require("express")
const router = express.Router()
const {createOrder, getOrderById, updateOrderToPay} = require("../../controllers/order/order")
const { ensureLogin } = require("../../helper/ensureLogin")
router.post("/create", ensureLogin, createOrder)
router.get("/:order_id", ensureLogin, getOrderById)
router.put("/:order_id/pay", ensureLogin, updateOrderToPay)

module.exports = router