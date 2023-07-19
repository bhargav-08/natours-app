const User = require('../models/userModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const { deleteOne, updateOne, getOne, getAll } = require('./handleFactory')

const filterObj = (body, ...required) => {
  const requiredObj = {}
  Object.keys(body).forEach((ele) => {
    if (required.includes(ele)) requiredObj[ele] = body[ele]
  })
  return requiredObj
}

const createUser = (req, res) => {
  res.status(500).json({
    status: 'success',
    message: 'This route is not defined! Please use signup!',
  })
}

const updateMe = catchAsync(async (req, res, next) => {
  // 1. Check if body has password then throw error
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This is route is not used to change password. Please use /updatePassword route.',
        400
      )
    )
  }
  // 2.Update email and name
  const filterBody = filterObj(req.body, 'name', 'email')

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    runValidators: true,
    new: true,
  })

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  })
})

const deleteMe = catchAsync(async (req, res, next) => {
  // set active value to false
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

const getMe = (req, res, next) => {
  req.params.id = req.user.id
  next()
}
// Only for admin to update fields that is not password
const updatedUser = updateOne(User)
const deleteUser = deleteOne(User)
const getUser = getOne(User)
const getAllUsers = getAll(User)

module.exports = {
  getAllUsers,
  getUser,
  updatedUser,
  deleteUser,
  updateMe,
  deleteMe,
  createUser,
  getMe,
}
