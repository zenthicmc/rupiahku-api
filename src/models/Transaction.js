"use strict"

const mongoose = require('mongoose')

const TransactionSchema = new mongoose.Schema({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	receiver_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	reference : {
		type: String,
	},
	merchant_ref : {
		type: String,
	},
	amount: {
		type: Number,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
	catatan: {
		type: String,
	},
	rekening: {
		type: String,
	},
	status: {
		type: String,
		default: 'Pending',
	},
	icon: {
		type: String,
	},
	icon_dark: {
		type: String,
	},
	createdAt: {
		type: Date,
		default: new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}),
	},
})

module.exports = mongoose.model('Transaction', TransactionSchema)