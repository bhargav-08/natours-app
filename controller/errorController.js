/* eslint-disable no-console */
const AppError = require('../utils/appError')

const sendDevError = (err, req, res) => {
  // API ERROR
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    })
  }
  // RENDERING ERROR
  console.error('ERROR 💥', err)
  return res
    .status(err.statusCode)
    .render('error', { title: 'Something went wrong !', msg: err.message })
}

const sendProdError = (err, req, res) => {
  // API ERROR
  if (req.originalUrl.startsWith('/api')) {
    // operation error,trusted error: send message to client
    if (err.isOperational) {
      return res
        .status(err.statusCode)
        .json({ status: err.status, message: err.message })
    }
    // programming error or other unknow error : don't leak error detatils
    console.log('ERROR 💥', err)
    return res
      .status(500)
      .json({ status: 'error', message: 'Something went very wrong!' })
  }

  // RENDERING ERROR
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err)
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    })
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err)
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  })
}

const handleCastError = (err) => {
  const msg = `Invalid  ${err.path}:${err.value}`
  return new AppError(msg, 400)
}

const handleDuplicationError = (err) => {
  const msg = `Duplicate Value !! => ${Object.keys(
    err.keyValue
  )}:${Object.values(err.keyValue)}`
  return new AppError(msg, 400)
}

const handleValidationError = (err) => {
  const msg = Object.values(err.errors).map((ele) => ele.message)
  return new AppError(msg.join('. '), 400)
}

const handleJWTError = (err) =>
  new AppError('Invalid Token. Please log in again', 401)

const handleJWTExpiredError = (err) =>
  new AppError('Your token had expired !!', 401)

const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    sendDevError(err, req, res)
  } else if (process.env.NODE_ENV === 'PRODUCTION') {
    // let error = { ...err }
    let error = Object.assign(err)
    if (error.name === 'CastError') error = handleCastError(error)
    if (error.code === 11000) error = handleDuplicationError(error)
    if (error.name === 'ValidationError') error = handleValidationError(error)
    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
    sendProdError(error, req, res)
  }
}

module.exports = errorController
