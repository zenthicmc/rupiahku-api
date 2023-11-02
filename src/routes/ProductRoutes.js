"use strict"

const express = require('express')
const router = express.Router()
const productController = require('../controllers/ProductController')

router.get('/:id', productController.show)
router.get('/:id/:code', productController.detail)

module.exports = router