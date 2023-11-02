"use strict"

const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
	return res.json({
		message: "Selamat Datang Di RupiahKu API",
	})
})


module.exports = router