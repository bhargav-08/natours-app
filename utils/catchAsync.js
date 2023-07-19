const catchAsync = function (fn) {
  function inner(req, res, next) {
    return fn(req, res, next).catch((err) => next(err))
  }
  return inner
}

module.exports = catchAsync
