"use strict"

require('../config/database')
const User = require('../models/User')
const Transaction = require('../models/Transaction')
const Notification = require('../models/Notification')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const hmacSHA256 = require('crypto-js/hmac-sha256'); 
const hex = require('crypto-js/enc-hex');
const { response400, response403, response404, response500 } = require('../helpers/response')
const moment = require("moment");

const capitalize = (text) => {
	return text.charAt(0).toUpperCase() + text.slice(1)
}

async function handle(req, res) {
	try {
		const reference = req.body.data.ref_id
		const transaction = await Transaction.findOne({ reference: reference })

		if (!transaction) {
			return response404(res, 'Transaction not found')
		}

		const status = req.body.data.status
		if(status == 1) {
			transaction.status = 'Success'
			transaction.save()
			
			const amount = transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
			await Notification.create({
            user_id: user._id,
            receiver_id: user._id,
            title: `Pembayaran ${capitalize(transaction.type)} Berhasil`,
            desc: `Pembayaran ${transaction.type} anda sebesar Rp ${amount} telah berhasil diverifikasi.`,
            icon: "https://cdn.rupiahku.pro/image/success.png",
            icon_dark: "https://cdn.rupiahku.pro/image/dark-success.png",
				createdAt: moment().locale("id").format("YYYY-MM-DD HH:mm:ss"),
         });

		} else {
			transaction.status = 'Failed'
			transaction.save()

			await Notification.create({
            user_id: user._id,
            receiver_id: user._id,
            title: `Pembayaran ${capitalize(transaction.type)} Gagal`,
            desc: `Pembayaran ${transaction.type} anda sebesar Rp ${amount} gagal dilakukan.`,
            icon: "https://cdn.rupiahku.pro/image/cancel.png",
            icon_dark: "https://cdn.rupiahku.pro/image/dark-cancel.png",
				createdAt: moment().locale("id").format("YYYY-MM-DD HH:mm:ss"),
         });
		}
	}
	catch (err) {
		console.log(err)
		return response500(res)
	}
}

module.exports = {
	handle
}