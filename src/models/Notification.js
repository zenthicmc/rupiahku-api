"use strict"

const mongoose = require('mongoose')
const moment = require("moment");

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
      type: String,
      default: moment().locale("id").format("YYYY-MM-DD HH:mm:ss"),
   },
});

module.exports = mongoose.model('Notification', NotificationSchema)