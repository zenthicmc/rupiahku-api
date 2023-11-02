"use strict"

const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	dbName: "rupiahku"
}

mongoose.connect(process.env.MONGODB_URI, options)
const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
	console.log('Database has been successfully connected')
})