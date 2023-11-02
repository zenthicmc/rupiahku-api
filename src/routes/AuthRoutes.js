"use strict"

const express = require('express')
const router = express.Router()
const authController = require('../controllers/AuthController')
const userController = require('../controllers/UserController')
const LoginValidator = require('../validators/LoginValidator')
const CreateUserValidator = require('../validators/CreateUserValidator')

router.post('/login', LoginValidator, authController.login)
router.post('/register', CreateUserValidator, userController.store)

module.exports = router