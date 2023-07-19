const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')

const getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find()
  

  res.status(200).render('overview', {
    title: 'All the Tours',
    tours,
  })
})

const getTour = catchAsync(async (req, res, next) => {
  const { slug } = req.params

  const tour = await Tour.findOne({ slug }).populate({
    path: 'reviews',
    select: 'review user rating',
  })

  // if (!tour) {
  //   return next(new AppError('No tour exists for such Name!!', 404))
  // }

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  })
})

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your accout',
  })
}
const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Account Details',
  })
}

const updateUserData = catchAsync(async (req, res) => {
  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  )
  res.status(200).render('account', {
    title: 'Account Details',
    user: updateUser,
  })
})

module.exports = {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  updateUserData,
}
