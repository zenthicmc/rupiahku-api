"use strict"

const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
   user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   title: {
      type: String,
      required: true,
   },
   desc: {
      type: String,
      required: true,
   },
   icon: {
      type: String,
   },
   icon_dark: {
      type: String,
   },
   createdAt: {
      type: Date,
      default: new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
   },
});

module.exports = mongoose.model('Notification', NotificationSchema)