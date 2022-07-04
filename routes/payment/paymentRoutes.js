const express = require("express")
const router = express.Router()

const { ensureLogin, adminAccess } = require("../../helper/ensureLogin")

const { listBank, initializePayment, chargeTransaction, submitTransactionPin, submitTransactionPhone, submitTransactionOtp, checkPendingTransaction, verifyTransaction, listTransaction, fetchTransaction, fetchTotalTransaction, exportTransactions, transactionTimeline, createTransferReceipient, listTransferReceipient, deleteTransferReceipient, initializedTransfer, finalizedTransfer, verifyTransfer, fetchTransferById, initializedBulkTransfer } = require("../../controllers/payment/payment")

router.post("/initialize", ensureLogin, initializePayment)
router.post("/charge", ensureLogin, chargeTransaction)
router.post("/submit_pin", ensureLogin, submitTransactionPin)
router.post("/submit_phone", ensureLogin, submitTransactionPhone)
router.post("/submit_otp", ensureLogin, submitTransactionOtp)
router.get("/pending_charge/:reference", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), checkPendingTransaction)
router.get("/verify/transaction/:reference", ensureLogin, ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), verifyTransaction)
router.get("/list/transactions", ensureLogin, ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), listTransaction)
// router.get("/transactions", ensureLogin,adminAccess(["super admin", "admin"]), listTransaction)
router.get("/transaction/:id", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), fetchTransaction)
router.get("/total/transactions", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), fetchTotalTransaction)
router.get("/export/transactions", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), exportTransactions)
router.get("/transaction/timeline/:id_or_reference", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), transactionTimeline)

//***************************************************************TRANSFER ********************************************************** */
router.get("/list-banks", ensureLogin, listBank)
router.post("/create/tranfer_recepient", ensureLogin, createTransferReceipient)
router.get("/list/tranfer_recepient", ensureLogin, listTransferReceipient)
router.delete("/remove/tranfer_recepient/:recipient_code_or_id", ensureLogin, deleteTransferReceipient)
router.post("/initialize/transfer", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]),  initializedTransfer)
router.post("/finalise/transfer", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), finalizedTransfer)
router.get("/verify/transfer/:reference", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), verifyTransfer)
router.get("/fetch/transfer/:id", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), fetchTransferById)
router.post("/initialize/bulk_transfer", ensureLogin, ensureLogin, adminAccess(["super admin", "admin"]), initializedBulkTransfer)

module.exports = router     