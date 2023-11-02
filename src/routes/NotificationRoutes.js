"use strict"

const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/NotificationController')

router.get('/', notificationController.show)

module.exports = router