"use strict"

require('../config/database')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const Notification = require('../models/Notification')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator');
const { response400, response403, response404, response500 } = require('../helpers/response')
const CheckOwner = require('../middlewares/CheckOwner')
const decodeJwt = require('../helpers/decodeJwt')
const axios = require('axios')
const hmacSHA256 = require('crypto-js/hmac-sha256'); 
const hex = require('crypto-js/enc-hex');

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
		
		if(req.body.amount < 10000) return response400(res, "Minimal withdraw Rp. 10.000")
		if(req.body.amount > 1000000) return response400(res, "Maksimal withdraw Rp. 1.000.000")

		const data = {
         user_id: token.sub,
         receiver_id: token.sub,
         amount: req.body.amount,
         rekening: req.body.rekening,
         type: "Withdraw",
			type_money: "outgoing",
         status: "Pending",
         icon: "https://cdn.tokoqu.io/image/tarik-tunai.png",
			icon_dark: "https://cdn.tokoqu.io/image/dark-tarik-tunai.png",
      };

		const user = await User.findById(token.sub)
		if(user.saldo < req.body.amount) return response400(res, "Saldo anda tidak cukup")

		const withdraw = await Transaction.create(data)
		if(withdraw) {
			user.saldo = parseInt(user.saldo) - parseInt(req.body.amount)
			user.save()

			const amount = req.body.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
			const notification = Notification.create({
            user_id: token.sub,
            receiver_id: token.sub,
            title: `Withdraw Dalam Proses`,
            desc: `Withdraw sebesar Rp. ${amount} sedang dalam proses. Silahkan cek secara berkala status withdraw anda.`,
            icon: "https://cdn.tokoqu.io/image/pending.png",
            icon_dark: "https://cdn.tokoqu.io/image/dark-pending.pngg",
         });

			return res.json({
				success: true,
				code: 200,
				message: "Withdraw berhasil",
				data: withdraw
			})
		}

	} catch (err) {
		return response500(res)
	}
}
		
module.exports = {
	store
}