const express = require("express")
const router = express.Router()

const {createEmailSubcriber, listEmailSubcribers, unsubcribe, contactSubcribers} = require("../../controllers/subscribe/subcribe")

router.post("/create", createEmailSubcriber)
router.post("/contact", contactSubcribers)
router.get("/", listEmailSubcribers)
router.delete("/unsubcribe", unsubcribe)
module.exports = router