const express = require('express')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')

dotenv.config({ path: './config/config.env'})

connectDB()

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

const websiteRoutes = require('./routes/websiteRoutes')
app.use('', websiteRoutes)

const usersRoute = require('./routes/usersRoute')
app.use('/api/users', usersRoute)

const postRoute = require('./routes/postRoute')
app.use('/api/posts', postRoute)


const PORT = process.env.PORT || 5000

app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)