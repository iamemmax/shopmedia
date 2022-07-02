const express = require("express")
const router = express.Router()

const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")

// const {initializePayment, verifyTransaction, listTransaction,fetchTransaction} = require("../../controllers/payment/payment")
const {listBank,initializePayment, chargeTransaction, submitTransactionPin,submitTransactionPhone, submitTransactionOtp} = require("../../controllers/payment/payment")

router.post("/initialize", ensureLogin, initializePayment)
router.post("/charge", ensureLogin, chargeTransaction)
router.post("/submit_pin", ensureLogin, submitTransactionPin)
router.post("/submit_phone", ensureLogin, submitTransactionPhone)
router.post("/submit_otp", ensureLogin, submitTransactionOtp)
// router.get("/verify/transaction/:id", ensureLogin, verifyTransaction)
// router.get("/transactions", ensureLogin,adminAccess(["super admin", "admin"]), listTransaction)
// router.get("/transaction/:id", ensureLogin, fetchTransaction)

router.get("/list-banks", ensureLogin, listBank)

module.exports = router 