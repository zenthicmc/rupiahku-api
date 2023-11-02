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

			const user = await User.findOne({ _id: transaction.user_id })
			user.saldo = user.saldo - transaction.amount
			user.save()

			const amount = transaction.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
			const notification = Notification.create({
				user_id: user._id,
				receiver_id: user._id,
				title: `Topup Berhasil`,
				desc: `Topup anda sebesar Rp ${amount} telah berhasil diverifikasi.`,
			})

		} else {
			transaction.status = 'Failed'
			transaction.save()
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