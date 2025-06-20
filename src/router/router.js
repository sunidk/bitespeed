const express = require("express");
const router = express.Router();
const { identifyContacts } = require("../controllers/controller");

router.post("/identify", identifyContacts);

module.exports = router;