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
		const apiKey = process.env.TRIPAY_API_KEY;
		const json = req.body;
		const signature = hmacSHA256(json, apiKey).toString(hex);
		const callbackSignature = req.headers['x-callback-signature']
		const privateKey = process.env.TRIPAY_PRIVATE_KEY
		const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

		if(!json) {
			return res.status(400).json({
				success: false,
				code: 400,
				message: 'Invalid data sent by payment gateway'
			});
		}

		if ('payment_status' !== req.headers['x-callback-event']) {
			return res.status(400).json({
				success: false,
				code: 400,
				message: 'Unrecognized callback event: ' + req.headers['x-callback-event']
			});
		}

		const uniqueRef = json.merchant_ref
		const status = json.status.toUpperCase()

		if (json.is_closed_payment === 1) {
			const result = await Transaction.findOne({ merchant_ref: uniqueRef })

			if (!result) {
				return res.status(400).json({
					success: false,
					code: 400,
					message: 'Invoice not found or already paid: ' + uniqueRef
				});
			}

			switch (status) {
				case 'PAID':
					result.status = 'Success'
					result.save()

					const user = await User.findOne({ _id: result.user_id })
					user.saldo = user.saldo + result.amount
					user.save()

					const amount = result.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")

					const notification = Notification.create({
						user_id: user._id,
						receiver_id: user._id,
						title: `Deposit Berhasil`,
						desc: `Deposit anda sebesar Rp ${amount} telah berhasil diverifikasi.`,
					})
					
					break;
				case 'UNPAID':
					result.status = 'Pending'
					result.save()
					break;
				case 'EXPIRED':
					result.status = 'Expired'
					result.save()
					break;
				case 'FAILED':
					result.status = 'Failed'
					result.save()
					break;
				default:
					return res.status(400).json({
						success: false,
						code: 400,
						message: 'Unrecognized payment status'
					});
			}

			return res.status(200).json({
				success: true
			});
		}
	} catch (err) {
		console.log(err)
		return res.status(500).json({
			success: false,
			code: 500,
			message: 'Internal server error'
		});
	}
}

module.exports = {
	handle
}