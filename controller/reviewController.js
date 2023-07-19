const Review = require('../models/reviewModel')
const { deleteOne, createOne, updateOne, getAll } = require('./handleFactory')

const setUserTour = (req, res, next) => {
  // Nested routes for /tours/:tourId/reviews
  if (!req.body.user) req.body.user = req.user.id
  if (!req.body.tour) req.body.tour = req.params.tourId
  next()
}

const createReview = createOne(Review)
const deleteReview = deleteOne(Review)
const patchReview = updateOne(Review)
const getReview = updateOne(Review)
const getAllReviews = getAll(Review)

module.exports = {
  getAllReviews,
  createReview,
  deleteReview,
  setUserTour,
  patchReview,
  getReview,
}
