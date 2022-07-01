const express = require("express")
const router = express.Router()

const {ensureLogin, adminAccess} = require("../../helper/ensureLogin")

// const {initializePayment, verifyTransaction, listTransaction,fetchTransaction} = require("../../controllers/payment/payment")
const {listBank} = require("../../controllers/payment/payment")

// router.post("/initialize", ensureLogin, initializePayment)
// router.get("/verify/transaction/:id", ensureLogin, verifyTransaction)
// router.get("/transactions", ensureLogin,adminAccess(["super admin", "admin"]), listTransaction)
// router.get("/transaction/:id", ensureLogin, fetchTransaction)

router.get("/banks", ensureLogin, listBank)

module.exports = router