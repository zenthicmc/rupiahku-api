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
		default: 'https://i.ibb.co/BT3DC0q/photo-Profile.webp',
	},
	createdAt: {
		type: Date,
		default: new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}),
	},
	token: {
		type: String,
	},
	verificationPin: {
		type: String,
	},
})

module.exports = mongoose.model('User', UserSchema)