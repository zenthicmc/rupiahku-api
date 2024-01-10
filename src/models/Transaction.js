"use strict"

const mongoose = require('mongoose')
const moment = require("moment");

const TransactionSchema = new mongoose.Schema({
   user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
   },
   receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
   },
   reference: {
      type: String,
   },
   merchant_ref: {
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
   type_money: {
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
      default: "Pending",
   },
   icon: {
      type: String,
   },
   icon_dark: {
      type: String,
   },
   createdAt: {
      type: String,
      default: moment().locale("id").format("YYYY-MM-DD HH:mm:ss"),
   },
});

module.exports = mongoose.model('Transaction', TransactionSchema)