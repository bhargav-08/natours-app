const dotenv = require('dotenv')

dotenv.config({ path: '.../../config.env' })

const fs = require('fs')
const mongoose = require('mongoose')

const Tour = require('../../models/tourModel')
const Review = require('../../models/reviewModel')
const User = require('../../models/userModel')

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((conn) => console.log('SUCCESS!!'))
  .catch((err) => console.log(err))

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
)
// console.log(tour)

const deleteALL = async () => {
  try {
    await Tour.deleteMany()
    await User.deleteMany()
    await Review.deleteMany()
    console.log('Delete Successfully')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

const importAll = async () => {
  try {
    await Tour.create(tours)
    await User.create(users, { validateBeforeSave: false })
    await Review.create(reviews)
    console.log('Imported Successfully')
  } catch (err) {
    console.log(err)
  }
  process.exit()
}

// console.log(process.argv[2])

if (process.argv[2] === '--deleteAll') {
  deleteALL()
}
if (process.argv[2] === '--importAll') {
  importAll()
}
