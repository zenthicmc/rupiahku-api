"use strict";

require("../config/database");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const {
   response400,
   response403,
   response404,
   response500,
} = require("../helpers/response");
const CheckOwner = require("../middlewares/CheckOwner");
const decodeJwt = require("../helpers/decodeJwt");
const axios = require("axios");
const hmacSHA256 = require("crypto-js/hmac-sha256");
const hex = require("crypto-js/enc-hex");
const MD5 = require("crypto-js/md5");
const moment = require("moment");

async function detail(req, res) {
   try {
      const api_key = process.env.IAK_API_KEY;
      const api_user = process.env.IAK_USERNAME;
      const signCheck = MD5(api_user + api_key + "cs").toString();

      // get data
      const data = await axios.post(
         "https://testpostpaid.mobilepulsa.net/api/v1/bill/check/",
         {
            commands: "checkstatus",
            ref_id: req.body.ref_id,
            username: api_user,
            sign: signCheck,
         },
         {
            headers: {
               "Content-Type": "application/json",
               "Accept-Encoding": "gzip,deflate,compress",
            },
         }
      );

      return res.status(200).json({
         success: true,
         code: 200,
         message: "Tagihan fetched successfully",
         data: data.data.data,
      });
   } catch (err) {
      return response500(res, err);
   }
}

async function inquiry(req, res) {
   try {
      const token = decodeJwt(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            success: false,
            code: 400,
            errors: errors.array(),
         });
      }

      const user = await User.findById(token.sub);

      const api_key = process.env.IAK_API_KEY;
      const api_user = process.env.IAK_USERNAME;
      const ref_id = "REF-" + Date.now();
      const sign = MD5(api_user + api_key + ref_id).toString();

      const tagihan = await axios.post(
         "https://testpostpaid.mobilepulsa.net/api/v1/bill/check/",
         {
            commands: "inq-pasca",
            hp: req.body.customer_id,
				code: req.body.code,
            ref_id: ref_id,
            username: api_user,
            sign: sign,
         },
         {
            headers: {
               "Content-Type": "application/json",
               "Accept-Encoding": "gzip,deflate,compress",
            },
         }
      );

		const tagihanData = tagihan.data.data;
		return res.status(200).json({
			success: true,
			code: 200,
			message: "Tagihan fetched successfully",
			data: tagihanData
		})
   } catch (err) {
      return response500(res, err);
   }
}

async function pay(req, res) {
   try {
      const token = decodeJwt(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json({
            success: false,
            code: 400,
            errors: errors.array(),
         });
      }

      const icon = {
         type: "tagihan",
         type_name: "Tagihan",
         icon: "https://cdn.tokoqu.io/image/tagihan.png",
         icon_dark: "https://cdn.tokoqu.io/image/dark-tagihan.png",
      };

      const user = await User.findById(token.sub);

      const api_key = process.env.IAK_API_KEY;
      const api_user = process.env.IAK_USERNAME;
      const signCheck = MD5(api_user + api_key + "cs").toString();

		// get data 
      const tagihan = await axios.post(
         "https://testpostpaid.mobilepulsa.net/api/v1/bill/check/",
         {
            commands: "checkstatus",
            ref_id: req.body.ref_id,
            username: api_user,
            sign: signCheck,
         },
         {
            headers: {
               "Content-Type": "application/json",
               "Accept-Encoding": "gzip,deflate,compress",
            },
         }
      );

		const tagihanData = tagihan.data.data;
		if(user.saldo < tagihanData.nominal) return response403(res, "Saldo anda tidak cukup");

		// request to pay
		const signPayment = MD5(api_user + api_key + tagihanData.tr_id).toString();
		const payment = await axios.post(
         "https://testpostpaid.mobilepulsa.net/api/v1/bill/check/",
         {
            commands: "pay-pasca",
            tr_id: tagihanData.tr_id,
            username: api_user,
            sign: signPayment,
         },
         {
            headers: {
               "Content-Type": "application/json",
               "Accept-Encoding": "gzip,deflate,compress",
            },
         }
      );

		const paymentData = payment.data.data;
		if(paymentData.response_code === "00") {
			// update saldo
			user.saldo = user.saldo - tagihanData.nominal;
			await user.save();

			// create transaction
			const saveDb = await Transaction.create({
				user_id: token.sub,
				receiver_id: token.sub,
				type: icon.type_name,
				icon: icon.icon,
				icon_dark: icon.icon_dark,
				status: "Success",
				reference: paymentData.ref_id,
				amount: paymentData.nominal,
				createdAt: moment().locale("id").format("YYYY-MM-DD HH:mm:ss"),
			});

			return res.status(200).json({
				success: true,
				code: 200,
				message: "Tagihan paid successfully",
				data: paymentData
			})
		}
   } catch (err) {
		console.log(err)
      return response500(res, err);
   }
}

module.exports = {
   detail,
   inquiry,
	pay
};
