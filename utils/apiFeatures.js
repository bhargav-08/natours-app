module.exports = class {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    const excludedFields = ['sort', 'page', 'fields', 'limit']

    let queryObj = { ...this.queryString }
    excludedFields.forEach((ele) => delete queryObj[ele])

    // 1B) Advance filtering for gte,le,gt,lte
    queryObj = JSON.stringify(queryObj).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (found) => `$${found}`
    )
    queryObj = JSON.parse(queryObj)
    this.query = this.query.find(queryObj)
    return this
  }

  sort() {
    console.log(this.queryString)
    if (this.queryString.sort) {
      const sortOrder = this.queryString.sort.split(',').join(' ')
      this.query = this.query.sort(sortOrder)
    } else {
      this.query = this.query.sort('-createdAt')
    }
    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join('')
      // console.log(fields)
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }
    return this
  }

  paginate() {
    const page = +this.queryString.page || 1
    const limit = +this.queryString.limit || 100
    const skip = +(page - 1) * limit

    this.query = this.query.skip(skip).limit(limit)
    return this
  }
}

// module.exports = APIFeatures
