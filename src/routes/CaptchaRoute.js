"use strict";

const express = require("express");
const router = express.Router();
const captchaController = require("../controllers/CaptchaController");

router.post('/verify', captchaController.verify);

module.exports = router;
