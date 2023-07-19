const express = require('express')
const {
  getTour,
  getOverview,
  getLoginForm,
  getAccount,
  updateUserData,
} = require('../controller/viewController')

const { isLoggedIn, protect } = require('../controller/authController')

const router = express.Router()

router.get('/', isLoggedIn, getOverview)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/me', protect, getAccount)
router.post('/submit-user-data', protect, updateUserData)

module.exports = router
