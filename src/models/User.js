"use strict"

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	nohp: {
		type: String,
		required: true,
		unique: true,
	},
	kelamin: {
		type: String,
		required: true,
		default: 'Male',
	},
	saldo: {
		type: Number,
		default: 0,
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		default: 'member',
	},
	image: {
		type: String,
		default: 'https://cdn.tokoqu.io/image/9febb626-a04c-4661-99ac-45a00d8d7f07.webp',
	},
	token: {
		type: String,
	},
	verificationPin: {
		type: String,
	},
	verifiedAt: {
		type: Date,
	},
	createdAt: {
		type: Date,
		default: new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}),
	},
})

module.exports = mongoose.model('User', UserSchema)