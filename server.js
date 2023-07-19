/* eslint-disable no-console */
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message, err.stack)
  console.log('UNHANDLED Exception ! 💥 Shutting Down')
  process.exit(1)
})

dotenv.config({ path: `${__dirname}/config.env` })

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
)

mongoose
  // .connect(process.env.DATABASE_LOCAL, {
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DATABASE SUCCESSFUL CONNECTION!!'))

const server = app.listen(process.env.PORT, () => {
  console.log(`Listening on PORT ${process.env.PORT}`)
})

process.on('rejectionHandled', (err) => {
  console.log(err.name, err.message)
  console.log('UNHANDLED REJECTION ! 💥 Shutting Down')
  server.close(() => {
    process.exit(1)
  })
})
