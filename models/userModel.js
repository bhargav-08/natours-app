const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name !'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    validate: [validator.isEmail, 'Please provide a valid email'],
    unique: true,
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    minlength: 8,
    type: String,
    required: [true, 'Please provide a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password'],
    validate: {
      validator: function (val) {
        return val === this.password
      },
      message: 'Password does not match!! ',
    },
  },
  passwordChangedAt: Date,
  passswordResetToken: { type: String, select: false },
  passwordResetExpires: { type: String, select: false },
  active: {
    type: Boolean,
    select: false,
    default: true,
  },
})

userSchema.pre('save', async function (next) {
  // Only run this function when password is modified
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next()
  this.passwordChangedAt = Date.now()
  next()
})

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})

userSchema.methods.checkPassword = async function (
  plainPassword,
  hashPassword
) {
  return await bcrypt.compare(plainPassword, hashPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  // JWTTimestamp is in seconds
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    )

    return JWTTimeStamp < changedTimestamp
  }
  return false
}

userSchema.methods.createResetPasswordToken = async function () {
  const token = await crypto.randomBytes(32).toString('hex')

  this.passswordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  console.log({ token }, this.passswordResetToken)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000
  return token
}

const User = mongoose.model('User', userSchema)

User.findByIdAndUpdate()

module.exports = User
