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
const sendSms = require("../helpers/sendSms");

async function show(req, res) {
	try {
		const data = await User.find()
		if(data.length <= 0) return response404(res, "Users not found")

		return res.json({
			success: true,
			code: 200,
			message: "Users fetched successfully",
			data: data
		})

	} catch (err) {
		return response500(res)
	}
}

async function detail(req, res) {
	try {
		const data = await User.findById(req.params.id)
		if(!data) return response404(res, "User with that id is not found")

		return res.json({
			success: true,
			code: 200,
			message: "User Detail fetched successfully",
			data: data
      })

	} catch (err) {
		return response404(res)
	}
}

async function store(req, res) {
	try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            success: false,
            code: 400,
            errors: errors.array(),
         });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const data = {
         name: req.body.name,
         email: req.body.email,
         nohp: req.body.nohp,
         kelamin: req.body.kelamin,
         password: hashedPassword,
         saldo: 50000,
      };

      if (req.body.kelamin == "Male")
         data.image =
            "https://cdn.tokoqu.io/image/9febb626-a04c-4661-99ac-45a00d8d7f07.webp";
      else
         data.image =
            "https://cdn.tokoqu.io/image/ca93faa9-fb82-4945-b1f8-02001a00b7a6.webp";

      // generate 6 digit random number
      const pin = Math.floor(100000 + Math.random() * 900000);
      data.verificationPin = pin;

      // send sms
      await sendSms(user.nohp, user.verificationPin);

		// create user
      await User.create(data, (err, user) => {
         if (err) {
            return res.status(400).json({
               success: false,
               code: 400,
               message: err.message,
            });
         }

         return res.json({
            success: true,
            code: 200,
            message: "User created successfully",
            data: {
               _id: user._id,
            },
         });
      });
   } catch (err) {
		return response500(res, err)
	}
}

async function update(req, res) {
	try {
		const oldData = await User.findById(req.params.id)

		const data = {
			name: req.body.name || oldData.name,
			email: req.body.email || oldData.email,
			nohp: req.body.nohp 	|| oldData.nohp,
			image: req.body.image || oldData.image,
			kelamin: req.body.kelamin || oldData.kelamin,
			password: req.body.password || oldData.password
		}

		await User.findByIdAndUpdate(req.params.id, data, {new: true}, (err, user) => {
			if(err) {
				return res.status(400).json({
					success: false,
					code: 400,
					message: err.message
				})
			}

			return res.json({
				success: true,
				code: 200,
				message: "User updated successfully",
				data: {
					_id: user._id,
				}
			})
		})

	} catch (err) {
		return response404(res)
	}
}

async function destroy(req, res) {
	try {
		const data = await User.findById(req.params.id)
		await data.remove()

		return res.json({
			success: true,
			code: 200,
			message: "User deleted successfully",
			data: {
				_id: data._id
			}
		})

	} catch (err) {
		return response404(res)
	}
}

async function getprofile(req, res) {
	try {
		const token = decodeJwt(req)
		const user = await User.findById(token.sub).select('name email nohp kelamin saldo image createdAt')
		
		const transactions = await Transaction
			.find({user_id: token.sub})
			.sort({createdAt: -1})
			.limit(3)
		
		return res.json({
			success: true,
			code: 200,
			message: "User Profile fetched successfully",
			data: {
				user,
				transactions
			}
		})

	} catch (err) {
		return console.log(err)
	}
}

async function getStats(req, res) {
	try {
		const token = decodeJwt(req)
		const uangMasuk = await Transaction.find({receiver_id: token.sub, status: 'Success'})
		const uangKeluar = await Transaction.find({user_id: token.sub, status: 'Success', type: {$ne: 'Deposit'}})

		const totalUangMasuk = uangMasuk.reduce((total, item) => {
			return total + item.amount
		}, 0)

		const totalUangKeluar = uangKeluar.reduce((total, item) => {
			return total + item.amount
		}, 0)
		
		return res.json({
			success: true,
			code: 200,
			message: "User Stats fetched successfully",
			data: {
				uangMasuk: totalUangMasuk,
				uangKeluar: totalUangKeluar
			}
		})

	} catch (err) {
		return console.log(err)
	}
}

async function recentUser(req, res) {
	try {
		const token = decodeJwt(req)

		// get all user except current user
		const users = await User.find()
			.sort({createdAt: -1})
			.where('_id').ne(token.sub)
			.select('name email nohp image kelamin saldo')
			.limit(7)

		const newUsers = users.map(user => {
			return {
				_id: user._id,
				name: user.name.split(' ')[0].toLowerCase(),
				email: user.email,
				nohp: user.nohp,
				image: user.image
			}
		})

		return res.json({
			success: true,
			code: 200,
			message: "Recents user fetched successfully",
			data: newUsers
		})

	} catch (err) {
		return response500(res)
	}
}

async function getUserByPhone(req, res) {
	try {
		const user = await User.findOne({nohp: req.params.phone}).select('name email nohp image kelamin saldo')
		if(!user)return response404(res, "User with that phone is not found")

		return res.json({
			success: true,
			code: 200,
			message: "Detail user fetched successfully",
			data: user
		})

	} catch (err) {
		return response500(res)
	}
}

async function verify(req, res) {
	try {
		const user = await User.findOne({nohp: req.body.nohp})
		if(!user) return response404(res, "User with that phone is not found")

		if (user.verificationPin != req.body.verificationPin)
         return response403(res, "Your verification code is not valid");

		// check if user already verified
		if(user.verifiedAt) return response403(res, "Your account is already verified")

		user.verifiedAt = new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"})
		user.save()

		return res.json({
			success: true,
			code: 200,
			message: "User verified successfully",
			data: {
				_id: user._id,
			}
		})

	} catch (err) {
		return response500(res)
	}
}

module.exports = {
	show,
	detail,
	store,
	update,
	destroy,
	getprofile,
	getStats,
	recentUser,
	getUserByPhone,
	verify
}