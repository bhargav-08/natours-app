const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review must be present'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: { type: Date, default: Date.now },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must have user!'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must have tour!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {
  // this.populate({ path: 'tour', select: 'name' })
  this.populate({
    path: 'user',
    select: 'name photo',
  })
  next()
})

reviewSchema.statics.calcAvgRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        ratingsQuantity: { $sum: 1 },
        ratingsAverage: { $avg: '$rating' },
      },
    },
  ])

  if (stats.length > 0) {
    const { ratingsAverage, ratingsQuantity } = stats[0]
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage,
      ratingsQuantity,
    })
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5,
    })
  }
}

reviewSchema.pre('save', function (next) {
  this.constructor.calcAvgRatings(this.tour)
  next()
})

// Store the executed id in this.r
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne()
  next()
})

// Retrieve id from that saved r
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAvgRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
