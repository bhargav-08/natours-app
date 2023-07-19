const express = require('express')
const {
  getAllReviews,
  createReview,
  deleteReview,
  setUserTour,
  patchReview,
  getReview,
} = require('../controller/reviewController')
const { protect, restrictTo } = require('../controller/authController')

// mergeParams allows us to use param of tourRoutes also
const router = express.Router({ mergeParams: true })

router.use(protect)

router
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setUserTour, createReview)

router
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), patchReview)

module.exports = router
