const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notificationController");

router.post("/email",notificationController.sendEmail);

module.exports = router;