const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
// const AppError = require('../utils/appError')
const {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} = require('./handleFactory')

const aliasTopCheapTours = (req, res, next) => {
  req.query.sort = '-ratingAverage,price'
  req.query.limit = '5'
  req.query.fields = 'name,duration,summary,price,maxGroupSize'
  next()
}

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$ratingAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        count: { $sum: 1 },
        numRating: { $sum: '$ratingQuantity' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ])
  res.status(201).json({
    status: 'Success',
    data: {
      stats,
    },
  })
})

const monthlyPlan = catchAsync(async (req, res, next) => {
  const { year } = req.params
  // console.log(year)
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },

    {
      $group: {
        _id: { $month: '$startDates' },
        numToursStart: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
  ])

  res.status(201).json({
    status: 'Success',
    data: {
      data: plan,
    },
  })
})

const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')
  if (!lat || !lng)
    return next(new AppError('Please provide  latitude and longitude!', 400))

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  })

  res.status(200).json({
    status: 'success',
    length: tours.length,
    data: { tours },
  })
})

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001
  const [lat, lng] = latlng.split(',')
  if (!lat || !lng)
    return next(new AppError('Please provide  latitude and longitude!', 400))

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [+lng, +lat], //necessary to change coord from string to number
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ])

  res.status(200).json({
    status: 'success',
    data: { distances },
  })
})

const createTour = createOne(Tour)
const deleteTour = deleteOne(Tour)
const patchTour = updateOne(Tour)
const getTour = getOne(Tour, { path: 'reviews' })
const getAllTours = getAll(Tour)

module.exports = {
  createTour,
  patchTour,
  deleteTour,
  getAllTours,
  getTour,
  aliasTopCheapTours,
  getTourStats,
  monthlyPlan,
  getToursWithin,
  getDistances,
}
