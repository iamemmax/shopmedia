const express = require("express")
const router = express.Router()

const {createEmailSubcriber, listEmailSubcribers, unsubcribe} = require("../../controllers/subscribe/subcribe")

router.post("/create", createEmailSubcriber)
router.get("/", listEmailSubcribers)
router.delete("/unsubcribe", unsubcribe)
module.exports = router