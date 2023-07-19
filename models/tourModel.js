const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name must have some name!!'],
      unique: true,
      stip: true,
      minlength: [10, 'Name should have atleast 10 character!!'],
    },
    slug: String,
    difficulty: {
      type: String,
      required: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'This is not difficulty type !!',
      },
    },
    // guides: Array,
    // Referencing the guides instead of Embedding
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    secretTour: Boolean,
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], // latitudes,longitudes
      description: String,
      address: String,
    },

    locations: [
      {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number],
        day: Number,
        description: String,
        address: String,
      },
    ],
    duration: { type: Number, required: [true, 'A tour must have duration!!'] },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size!!'],
    },
    summary: {
      type: String,
      required: [true, 'A tour must have description !!'],
      strip: true,
    },
    rating: { type: Number, default: 4.5 },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      set: (val) => Math.round(val * 10) / 10, //4.6666666 => 46.66 =47/10=>4.7
    },
    ratingsQuantity: { type: Number, default: 0 },

    price: { type: Number, required: [true, 'A tour must have price!!'] },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price
        },
        message:
          'This price discount value of {VALUE} is much greater than orginal price!!',
      },
    },

    description: {
      type: String,
      strip: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

tourSchema.index({ slug: 1 })
// Compound index which is combination of two  or more fields
tourSchema.index({ price: 1, ratingAverage: -1 })

// Create 2dsphere index so that it can be used by geoWithin and geoNear
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationOfWeeks').get(function () {
  return this.duration / 7
})

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
})

// DOCUMENT MIDDLEWARE
// 'save' will be executed only .save() and .create() not insertMany(),insertOne()
tourSchema.pre('save', function (next) {
  // this points to current document object
  this.slug = slugify(this.name, { lower: true })
  next()
})

// Code to embed the document
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(
//     async (ele) => await User.findById(ele)
//   )
//   this.guides = await Promise.all(guidesPromises)
//   next()
// })

// tourSchema.post('save', function (doc, next) {
//   // doc points to the saved document
//   console.log(doc)
//   next()
// })

// Query MiddleWare
tourSchema.pre(/^find/, function (next) {
  this.start = Date.now()
  this.find({ secretTour: { $ne: true } })
  next()
})

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -_id',
  })
  next()
})

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} ms`)
  next()
})

// Aggreggate MiddleWare
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//   next()
// })

const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour
