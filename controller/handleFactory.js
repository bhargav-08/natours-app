const AppError = require('../utils/appError')
const catchAsync = require('../utils/catchAsync')
const APIFeatures = require('../utils/apiFeatures')

const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // console.log('Deleting...')
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(new AppError('No such ID exists !!', 404))
    }

    res.status(204).json({ status: 'success' })
  })

const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
      status: 'success',
      data: {
        document: doc,
      },
    })
  })

const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!doc) {
      return next(new AppError('No such ID exists !!', 404))
    }
    res.status(200).json({ status: 'success', data: { doc } })
  })

const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = await Model.findById(req.params.id)
    // console.log(popOptions)
    // console.log(query)
    if (popOptions) query.populate(popOptions)
    const doc = await query

    if (!doc) {
      return next(new AppError('No such ID exists !!', 404))
    }
    res.status(200).json({ status: 'success', data: { doc } })
  })

const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    /*
    // 1A)  Filtering
    const excludedFields = ['sort', 'page', 'fields', 'limit']

    let queryObj = { ...req.query }
    excludedFields.forEach((ele) => delete queryObj[ele])

    // 1B) Advance filtering for gte,le,gt,lte
    queryObj = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (found) => `$${found}`
    )
    queryObj = JSON.parse(queryObj)
    let query = Tour.find(queryObj)

    // 2) Sort the query result
    if (req.query.sort) {
      const sortOrder = req.query.sort.split(',').join(' ')
      query = query.sort(sortOrder)
    } else {
      query = query.sort('-createdAt')
    }

    // 3) Limiting Fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      // console.log(fields)
      query = query.select(fields)
    } else {
      query = query.select('-__v')
    }

    // 4) Pagination
    console.log(req.query)
    const page = +req.query.page || 1
    const limit = +req.query.limit || 10
    const skip = +(page - 1) * limit

    query = query.skip(skip).limit(limit)

    if (req.query.page) {
      const cnt = await Tour.countDocuments()
      if (cnt <= skip) {
        throw new Error('This page does not exists!!')
      }
    } 
    */

    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    const docs = await features.query
    // const docs = await features.query.explain()

    res.status(200).json({
      status: 'success',
      result: docs.length,
      data: { docs },
    })
  })
module.exports = { deleteOne, createOne, updateOne, getOne, getAll }
