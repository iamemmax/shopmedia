const express = require("express")
const router = express.Router()

const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")

// const {initializePayment, verifyTransaction, listTransaction,fetchTransaction} = require("../../controllers/payment/payment")
const {listBank, createCustomer, getCustomer, customerRisk, checkOut, initializeTransaction, verifyTransaction, chargeTransaction} = require("../../controllers/payment/payment")
router.get("/banks", ensureLogin, listBank)
router.post("/create/customer", ensureLogin, createCustomer)
router.get("/customer/:customer_code", ensureLogin, getCustomer)
router.get("/customer/risk/:customer", ensureLogin, customerRisk)
router.post("/checkout/:user_id", ensureLogin, checkOut)
router.post("/inintialize", ensureLogin, initializeTransaction)
router.get("/verify/:reference",  verifyTransaction)
router.post("/callback", ensureLogin, chargeTransaction)

module.exports = router