const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const cookieParser = require('cookie-parser')

const AppError = require('./utils/appError')
const GlobalErrorHandler = require('./controller/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1. GLOBAL MIDDLEWARES
// Middleware for serving static files
app.use(express.static(`${__dirname}/public`))

// Using helmet
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      fontSrc: [
        "'self'", // Default policy for specifiying valid sources for fonts loaded using "@font-face": allow all content coming from origin (without subdomains).
        'https://fonts.gstatic.com', // Google Fonts.
      ],
      styleSrc: [
        "'self'", // Default policy for valid sources for stylesheets: allow all content coming from origin (without subdomains).
        'https://fonts.googleapis.com', // Google Fonts.
        'https://api.mapbox.com/',
        "'unsafe-inline'",
      ],
      scriptSrc: [
        'https://api.mapbox.com/',
        'https://cdnjs.cloudflare.com/ajax/libs/',
        "'unsafe-inline'",
        'http://localhost:8000',
        'wss',
      ],
      workerSrc: ['blob:'],
      connectSrc: ['*'],
    },
  })
)

// Middleware to rate limit the request for 100 request per hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,Please try again in an hour!',
})
app.use('/api', limiter)

// Middleware for logging
if (process.env.NODE_ENV === 'DEVELOPMENT') {
  app.use(morgan('dev'))
}

// Middleware that parses json body  into req.body
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Middleware to parse the cookie from request
app.use(cookieParser())

// Data Sanitization for NoSQL query injection
app.use(mongoSanitize())

// Data Sanitization against xss
app.use(xss())

// Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'difficulty',
      'ratingAverage',
      'ratingQuantity',
      'maxGroupSize',
    ],
  })
)

// Test Middlware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  // console.log(req.cookies.jwt)
  next()
})

// 2. ROUTES

// This is route for the view
app.use('/', viewRouter)

// This are routes for API
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)

app.all('*', (req, res, next) => {
  next(new AppError(`No page for ${req.originalUrl} exists!`, 404))
})

// 3. GLOBAL Error Handler
app.use(GlobalErrorHandler)

module.exports = app
