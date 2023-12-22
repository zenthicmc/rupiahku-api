"use strict"

const express = require('express')
const router = express.Router()
const userController = require('../controllers/UserController')
const CreateUserValidator = require('../validators/CreateUserValidator')
const UpdateProfileValidator = require('../validators/UpdateProfileValidator')

router.get('/getprofile', userController.getprofile)
router.get('/getstats', userController.getStats)
router.get('/recents', userController.recentUser)
router.get('/phone/:phone', userController.getUserByPhone)

router.get('/', userController.show)
router.get('/:id', userController.detail)
router.post('/', CreateUserValidator, userController.store)
router.delete('/:id', userController.destroy)

// update profile routes
router.put("/updateProfile", UpdateProfileValidator, userController.updateProfile);
router.put("/updateImage", userController.updateImage);
router.put("/updatePassword", userController.updatePassword);

module.exports = router