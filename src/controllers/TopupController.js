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
const MD5 = require('crypto-js/md5');

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

		const icons = [
         {
            type: "etoll",
            icon: "https://cdn.tokoqu.io/image/e-wallet.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-e-wallet.png",
         },
         {
            type: "game",
            icon: "https://cdn.tokoqu.io/image/game.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-game.png",
         },
         {
            type: "data",
            icon: "https://cdn.tokoqu.io/image/internet.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-internet.png",
         },
         {
            type: "pln",
            icon: "https://cdn.tokoqu.io/image/pln.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-pln.png",
         },
         {
            type: "others",
            icon: "https://cdn.tokoqu.io/image/others.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-others.png",
         },
         {
            type: "pulsa",
            icon: "https://cdn.tokoqu.io/image/pulsa.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-pulsa.png",
         },
         {
            type: "tagihan",
            icon: "https://cdn.tokoqu.io/image/tagihan.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-tagihan.png",
         },
         {
            type: "voucher",
            icon: "https://cdn.tokoqu.io/image/voucher.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-voucher.png",
         },
      ];

		const selected = icons.find((icon) => icon.type === req.body.type);
		const data = {
         user_id: token.sub,
         receiver_id: token.sub,
         type: req.body.type,
         icon: selected.icon,
         icon_dark: selected.icon_dark,
      };

		const user = await User.findById(token.sub)

		const api_key = process.env.IAK_API_KEY
		const api_user = process.env.IAK_USERNAME
		const ref_id = "REF-" + Date.now()
		const sign = MD5(api_user + api_key + ref_id).toString();

		// post to https://prepaid.iak.dev/api/top-up with raw body
		const topup = await axios.post('https://prepaid.iak.dev/api/top-up', {
			customer_id: req.body.receiver,
			product_code: req.body.product_code,
			ref_id: ref_id,
			username: api_user,
			sign: sign
		}, {
			headers: {
				'Content-Type': 'application/json',
				"Accept-Encoding": "gzip,deflate,compress",
			}
		})

		if(user.saldo < topup.data.data.price) return response400(res, "Saldo anda tidak cukup")
		if(topup.data.data.message == "PROCESS") {
			data.status = "Pending"
			data.reference = ref_id
			data.amount = topup.data.data.price

			const transaction = await Transaction.create(data)

			user.saldo = parseInt(user.saldo) - parseInt(topup.data.data.price)
			user.save()

			return res.json({
				success: true,
				code: 200,
				message: "Topup berhasil",
				data: transaction
			})
		}

	} catch (err) {
		console.log(err)
		return response500(res, err)
	}
}
		
module.exports = {
	store
}