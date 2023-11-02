"use strict"

const express = require('express')
const router = express.Router()
const tripayCallback = require('../callback/TripayCallback')
const iakCallback = require('../callback/IakCallback')

router.post('/tripay', tripayCallback.handle)
router.post('/iak', iakCallback.handle)

module.exports = router