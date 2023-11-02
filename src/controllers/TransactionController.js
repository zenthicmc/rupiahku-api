"use strict"

require('../config/database')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator');
const { response403, response404, response500 } = require('../helpers/response')
const CheckOwner = require('../middlewares/CheckOwner')
const decodeJwt = require('../helpers/decodeJwt')
const axios = require('axios')
const hmacSHA256 = require('crypto-js/hmac-sha256'); 
const hex = require('crypto-js/enc-hex');
const MD5 = require('crypto-js/md5');

async function show(req, res) {
	try {
		const token = decodeJwt(req)
		let data

		if(req.query.type == "Deposit") data = await Transaction.find({ user_id: token.sub, type: "Deposit" }).sort({createdAt: -1})
		else if(req.query.type == "Transfer") data = await Transaction.find({ user_id: token.sub, type: "Transfer" }).sort({createdAt: -1})
		else if(req.query.type == "Withdraw") data = await Transaction.find({ user_id: token.sub, type: "Withdraw" }).sort({createdAt: -1})
		else if(req.query.type == "Topup") data = await Transaction.find({ user_id: token.sub, type: "Topup" }).sort({createdAt: -1})
		else data = await Transaction.find({ user_id: token.sub }).sort({createdAt: -1})

		if(req.query.status == "Pending") data = data.filter(item => item.status == "Pending")
		else if(req.query.status == "Success") data = data.filter(item => item.status == "Success")
		else if(req.query.status == "Failed") data = data.filter(item => item.status == "Failed")
		
		return res.json({
			success: true,
			code: 200,
			message: "Your transactions fetched successfully",
			data: data
		})

	} catch (err) {
		return response500(res)
	}
}

async function detail(req, res) {
	try {
		const data = await Transaction.findById(req.params.id)
		if(!data) return response404(res)

		if(data.type == "Deposit") {
			const tripay = await axios.get('https://tripay.co.id/api-sandbox/transaction/detail/?reference=' + data.reference, {
				headers: {
					'Authorization': 'Bearer ' + process.env.TRIPAY_API_KEY,
					"Accept-Encoding": "gzip,deflate,compress",
				}
			})

			return res.json({
				success: true,
				code: 200,
				message: "Transaction Detail fetched successfully",
				data: tripay.data.data,
			})
		} 
		else if(data.type == "Transfer") {
			const receiver = await User.findById(data.receiver_id).select('-password -createdAt -updatedAt -__v -token -role -saldo')
			const sender = await User.findById(data.user_id).select('-password -createdAt -updatedAt -__v -token -role -saldo')

			return res.json({
				success: true,
				code: 200,
				message: "Transaction Detail fetched successfully",
				data: {
					_id: data._id,
					user_id: data.user_id,
					receiver_id: data.receiver_id,
					amount: data.amount,
					type: data.type,
					status: data.status,
					createdAt: data.createdAt,
					receiver: receiver,
					sender: sender
				}
			})
		}
		else if(data.type == "Withdraw") {
			const receiver = await User.findById(data.receiver_id).select('-password -createdAt -updatedAt -__v -token -role -saldo')
			const sender = await User.findById(data.user_id).select('-password -createdAt -updatedAt -__v -token -role -saldo')

			return res.json({
				success: true,
				code: 200,
				message: "Transaction Detail fetched successfully",
				data: {
					_id: data._id,
					user_id: data.user_id,
					receiver_id: data.receiver_id,
					amount: data.amount,
					rekening: data.rekening,
					type: data.type,
					status: data.status,
					createdAt: data.createdAt,
					receiver: receiver,
					sender: sender
				}
			})
		} 
		else if(data.type == "Topup") {
			const api_key = process.env.IAK_API_KEY
			const api_user = process.env.IAK_USERNAME
			const ref_id = data.reference
			const sign = MD5(api_user + api_key + ref_id).toString();

			const topup = await axios.post('https://prepaid.iak.dev/api/check-status', {
				ref_id: ref_id,
				username: api_user,
				sign: sign
			}, {
				headers: {
					'Content-Type': 'application/json',
					"Accept-Encoding": "gzip,deflate,compress",
				}
			})
			const receiver = await User.findById(data.receiver_id).select('-password -createdAt -updatedAt -__v -token -role -saldo')
			const sender = await User.findById(data.user_id).select('-password -createdAt -updatedAt -__v -token -role -saldo')

			let status;
			if(topup.data.data.message == "PROCESS") status = "Pending"
			else if(topup.data.data.message == "SUCCESS") status = "Success"
			else status = "Failed"

			return res.json({
				success: true,
				code: 200,
				message: "Transaction Detail fetched successfully",
				data: {
					_id: data._id,
					reference: data.reference,
					user_id: data.user_id,
					receiver_id: data.receiver_id,
					product_code: topup.data.data.product_code,
					amount: data.amount,
					type: data.type,
					status: status,
					createdAt: data.createdAt,
					receiver: receiver,
					sender: sender
				}
			})
		}

		return res.json({
			success: true,
			code: 200,
			message: "Transaction Detail fetched successfully",
			data: data
		})

	} catch (err) {
		return response500(res)
	}
}

module.exports = {
	show,
	detail,
}
