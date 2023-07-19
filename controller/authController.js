const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const sendEmail = require('../utils/mail')

const JWToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })

const createSendToken = (user, statusCode, res) => {
  const token = JWToken(user.id)

  const cookieOptions = {
    httpOnly: true, // access cookie using http method only not by document.cookie in browser
    maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  }

  if (process.env.NODE_ENV === 'PRODUCTION') {
    cookieOptions.secure = true
  }

  res.cookie('jwt', token, cookieOptions)
  // removing password from json response
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  })
}

const logout = (req, res, next) => {
  res.cookie('jwt', 'logout', {
    httpOnly: true,
    maxAge: Date.now() + 10 * 1000,
  })
  res.status(200).json({ status: 'success' })
}

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body)
  createSendToken(newUser, 201, res)
})

const login = catchAsync(async (req, res, next) => {
  // 1. Check whether email and password in body
  const { email, password } = req.body
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400))
  }

  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Email or password does not match', 401))
  }

  // 3. if ok ,send jwt to client
  createSendToken(user, 200, res)
})

const isLoggedIn = async (req, res, next) => {
  // 1.getting token and check if it exist
  if (req.cookies.jwt) {
    try {
      // 1. Getting token and checking if its there
      const decodedPayload = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      )

      // 2. check if user exist and is not deleted after logging in
      const currentUser = await User.findById(decodedPayload.id)
      if (!currentUser) {
        return next()
      }
      // 3. check if the user changed password after token was issused
      if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
        return next()
      }
      // there is logged in user
      res.locals.user = currentUser //locals accessible to every template
      req.user = currentUser
      return next()
    } catch (err) {
      return next()
    }
  }
  next()
}

const protect = catchAsync(async (req, res, next) => {
  // 1.getting token and check if it exist
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(
      new AppError('You are not logged in ! Please log in to get access.', 401)
    )
  }

  // 2. verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3. check if user still exist
  const currUser = await User.findById(decode.id)
  if (!currUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist. ',
        401
      )
    )
  }
  // 4. check if user has changed password
  if (currUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError(
        'User recently  changed password ! Please log in again.',
        401
      )
    )
  }
  res.locals.user = currUser
  req.user = currUser
  next()
})

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action!', 403)
      )
    }
    next()
  }

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Check if such user exist for the given email

  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new AppError('No user for such email exists!', 404))
  }

  // 2. generate reset token
  const token = await user.createResetPasswordToken()
  await user.save({
    validateBeforeSave: false,
  })

  // 3. Send the reset token via email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${token}`

  const message = `Forgot your Password? Submit a Patch request with your new password and confirm password to ${resetURL}.\n If you didn't forgot your password,please ignore this email!`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min) ',
      message,
    })

    createSendToken(user, 200, res)
  } catch (err) {
    user.passwordResetExpires = undefined
    user.passswordResetToken = undefined
    await user.save({ validateBeforeSave: false })
    return next(
      new AppError('There was error sending email.Try again later!', 500)
    )
  }
})

const resetPassword = catchAsync(async (req, res, next) => {
  // 1.check if user exists for given token
  const passswordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passswordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  })
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400))
  }
  // 2. If token is not expired and their is user ,set new password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetExpires = undefined
  user.passswordResetToken = undefined
  await user.save()

  // 3. update passwordChangedAt
  // This is implemented as pre-save hook on userSchema

  // 4. log in user and send JWT
  createSendToken(user, 200, res)
})

const updatePassword = catchAsync(async (req, res, next) => {
  // 1.Get user from the collection
  const user = await User.findById(req.user.id).select('+password')

  // 2.Check if posted password  is correct
  if (!(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError('Your current password is wrong', 401))
  }
  // 3. If so,update
  user.password = req.body.newPassword
  user.passwordConfirm = req.body.newPasswordConfirm
  await user.save()
  // Do not use .findByIdAndUpdate will not work as it will not check validator and no presave hook executed for update

  // 4. log in user and send JWT
  createSendToken(user, 200, res)
})

module.exports = {
  signup,
  login,
  logout,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  isLoggedIn,
}
