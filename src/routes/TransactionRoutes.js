"use strict"

const express = require('express')
const router = express.Router()
const transactionController = require('../controllers/TransactionController')
const depositController = require('../controllers/DepositController')
const transferController = require('../controllers/TransferController')
const withdrawController = require('../controllers/WithdrawController')
const topupController = require('../controllers/TopupController')
const createDepositValidator = require('../validators/CreateDepositValidator')
const createTransferValidator = require('../validators/CreateTransferValidator')
const createWithdrawValidator = require('../validators/CreateWithdrawValidator')
const createTopupValidator = require('../validators/CreateTopupValidator')

// Deposit
router.get('/', transactionController.show)
router.get('/:id', transactionController.detail)
router.post('/deposit', createDepositValidator, depositController.store)
router.post('/transfer', createTransferValidator, transferController.store)
router.post('/withdraw', createWithdrawValidator, withdrawController.store)
router.post('/topup', createTopupValidator, topupController.store)

module.exports = router