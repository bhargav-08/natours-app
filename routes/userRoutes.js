const express = require('express')
const {
  signup,
  login,
  logout,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  restrictTo,
} = require('../controller/authController')

const {
  getAllUsers,
  getUser,
  updatedUser,
  deleteUser,
  updateMe,
  deleteMe,
  createUser,
  getMe,
} = require('../controller/userController')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)
router.post('/forgotPassword', forgotPassword)
router.patch('/resetPassword/:token', resetPassword)

// To protect all the below routes
router.use(protect)

router.patch('/updatePassword', updatePassword)
router.patch('/updateMe', updateMe)
router.delete('/deleteMe', deleteMe)
router.get('/getMe', getMe, getUser)

router.use(restrictTo('admin'))

router.route('/').get(getAllUsers).post(createUser)

router
  .route('/:id/:optional?')
  .get(getUser)
  .patch(updatedUser)
  .delete(deleteUser)

module.exports = router
