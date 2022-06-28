const express = require("express")
const router = express.Router()
let {negotiate,listMyOfer,DeleteMyOfer} = require("../../controllers/Bussiness/negotiate")

router.post("/negotiate/:id", negotiate)
router.get("/myoffer/:id", listMyOfer)
router.delete("/myoffer/remove/:id", DeleteMyOfer)


module.exports = router