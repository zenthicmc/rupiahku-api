"use strict";

const express = require("express");
const router = express.Router();
const tagihanController = require("../controllers/TagihanController");

router.post("/detail", tagihanController.detail);
router.post("/inquiry", tagihanController.inquiry);
router.post("/pay", tagihanController.pay);

module.exports = router;
