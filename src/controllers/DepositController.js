"use strict"

require('../config/database')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator');
const { response400, response403, response404, response500 } = require('../helpers/response')
const CheckOwner = require('../middlewares/CheckOwner')
const decodeJwt = require('../helpers/decodeJwt')
const axios = require('axios')
const hmacSHA256 = require('crypto-js/hmac-sha256'); 
const hex = require('crypto-js/enc-hex');
const moment = require("moment");

async function store(req, res) {
	try {
		const token = decodeJwt(req)
		const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					code: 400,
					errors: errors.array()
				});
			}

		if(req.body.amount < 10000) return response400(res, "Minimal deposit Rp. 10.000")
		if(req.body.amount > 1000000) return response400(res, "Maksimal deposit Rp. 1.000.000")

		const data = {
         user_id: token.sub,
         receiver_id: token.sub,
         amount: req.body.amount,
         type: "Deposit",
         icon: "https://cdn.tokoqu.io/image/deposit.png",
         icon_dark: "https://cdn.tokoqu.io/image/dark-deposit.png",
         createdAt: moment().locale("id").format("YYYY-MM-DD HH:mm:ss"),
      };

		try {
			const merchant_code = process.env.TRIPAY_MERCHANT_CODE
			const merchant_ref = "REF-" + new Date().getTime().toString();
			// 24 jam
			const expiry = parseInt(Math.floor(new Date()/1000) + (24*60*60));

			const signature = hmacSHA256(merchant_code + merchant_ref + req.body.amount, process.env.TRIPAY_PRIVATE_KEY).toString(hex);

			const user = await User.findById(token.sub)
			const payload = {
				'method': req.body.method,
				'merchant_ref': merchant_ref,
				'amount': req.body.amount,
				'customer_name': user.name,
				'customer_email': user.email,
				'customer_phone': user.nohp,
				'order_items': [
					{
						'sku': 'Deposit',
						'name': 'Rupiahku',
						'price':  req.body.amount,
						'quantity': 1,
						'product_url': 'https://tokokamu.com/product/nama-produk-1',
						'image_url': 'https://tokokamu.com/product/nama-produk-1.jpg'
					},
				],
				'return_url': 'https://domainanda.com/redirect',
				'expired_time': expiry,
				'signature': signature
			}

			const response = await axios.post('https://tripay.co.id/api-sandbox/transaction/create', payload, {
				headers: {
					'Authorization': 'Bearer ' + process.env.TRIPAY_API_KEY,
					"Accept-Encoding": "gzip,deflate,compress",
				}
			})

			if(response.data.success == true) {
				data.reference = response.data.data.reference
				data.merchant_ref = merchant_ref
				const transaction = await Transaction.create(data)
				return res.json({
					success: true,
					code: 200,
					message: "Transaction created successfully",
					data: {
						_id: transaction._id,
						reference: response.data.data.reference,
						merchant_ref: response.data.data.merchant_ref
					}
				})
			} else {
				return res.status(400).json({
					success: false,
					code: 400,
					message: response.data.message
				})
			}

		} catch (err) {
			return response500(res)
		}

	} catch (err) {
		return response500(res)
	}
}
	
module.exports = {
	store
}