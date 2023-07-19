const express = require('express')
const {
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
} = require('../controller/tourController')
const { protect, restrictTo } = require('../controller/authController')

const reviewRouter = require('./reviewRoutes')

const router = express.Router()

// This middleware is specific to this subapplication of tours as it is declared inside this tour router

// Not good way of having using reviewController inside tourRoutes
// router.route('/:tourId/reviews').post(protect, createReview)

// POST tours/12abcd/reviews
// GET tours/12abcd/reviews
// GET tours/12abcd/reviews/ab1234
router.use('/:tourId/reviews', reviewRouter)

router.route('/top-5-cheapest-tours').get(aliasTopCheapTours, getAllTours)

router.route('/tours-stats').get(protect, getTourStats)

// GET tours-within/300/center/34.111745,-118.113/unit/mi
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin)

// GET tours-within/300/center/34.111745,-118.113/unit/mi
router.route('/distances/:latlng/unit/:unit').get(getDistances)

router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), monthlyPlan)

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour)

router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), patchTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour)

module.exports = router
