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
const internet = require('../data/internet.json')
const listrik = require('../data/listrik.json')
const game = require('../data/game.json')
const voucher = require('../data/voucher.json')
const emoney = require('../data/emoney.json')
const pulsa = require('../data/pulsa.json')

async function show(req, res) {
	try {
		let data

		if(req.params.id == "internet") data = internet.data
		else if(req.params.id == "listrik") data = listrik.data
		else if(req.params.id == "game") data = game.data
		else if(req.params.id == "voucher") data = voucher.data
		else if(req.params.id == "emoney") data = emoney.data
		else if(req.params.id == "pulsa") data = pulsa.data
		else return response404(res, "Product type not found")

		return res.status(200).json({
			success: true,
			code: 200,
			message: "Products fetched successfully",
			data: data
		})

	} catch (err) {
		return response500(res)
	}
}

async function detail(req, res) {
	try {
		const api_key = process.env.IAK_API_KEY
		const api_user = process.env.IAK_USERNAME
		const additional = 'pl';
		const sign = MD5(api_user + api_key + additional).toString();

		const price = await axios.post(`https://prepaid.iak.dev/api/pricelist/${req.params.id}/${req.params.code}`, {
			status: "active",
			username: api_user,
			sign: sign
		}, {
			headers: {
				'Content-Type': 'application/json',
				"Accept-Encoding": "gzip,deflate,compress",
			}
		})

		if(!price.data.data.pricelist) return response404(res, "Product code not found")
		// sort from cheapest price to highest price
		price.data.data.pricelist.sort((a, b) => a.product_price - b.product_price)		

		return res.status(200).json({
			success: true,
			code: 200,
			message: "Product fetched successfully",
			data: price.data.data.pricelist
		})

	} catch (err) {
		return response500(res)
	}
}

module.exports = {
	show,
	detail
}