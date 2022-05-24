const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const errorHandler = require('./middleware/errorHandler')
const paramSanitizer = require('./middleware/sanitizer')
const connectDB = require('./config/db')

dotenv.config({ path: './config/config.env'})

connectDB()

const shouldSanitize = process.env.NODE_ENV == "sanitized"

const app = express()

app.set('view engine', 'ejs')

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(express.static(__dirname));

const logger = require('./middleware/logger')
app.use(logger) 

const dbLogger = require('./middleware/dbLogger')
app.use(dbLogger)

if (shouldSanitize) {
    app.use(paramSanitizer)

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    })
    app.use(limiter)
    // Code from: https://www.npmjs.com/package/express-rate-limit

    const paramPollutionPreventer = require('./middleware/paramPollutionPreventer')
    app.use(paramPollutionPreventer)
}

// MARK: - Setup routes
const websiteRoutes = require('./routes/websiteRoutes')
app.use('', websiteRoutes)

const usersRoute = require('./routes/usersRoute')
app.use('/api/users', usersRoute)

const postRoute = require('./routes/postRoute')
app.use('/api/posts', postRoute)


// Middleware
app.use(errorHandler)


const PORT = process.env.PORT || 5000

app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.magenta.bold)
)