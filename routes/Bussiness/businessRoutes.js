const express = require("express")
const router = express.Router()
let {negotiate,listMyOfer} = require("../../controllers/Bussiness/negotiate")

router.post("/negotiate/:id", negotiate)
router.get("/myoffer/:id", listMyOfer)


module.exports = router