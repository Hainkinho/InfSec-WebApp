const mongoose = require('mongoose')

const shouldSanitize = process.env.NODE_ENV == "sanitized"

const connectDB = async () => {
    const dbURI = shouldSanitize ? process.env.MONGO_URI_SANITIZED : process.env.MONGO_URI
    const conn = await mongoose.connect(dbURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

    console.log(`MongoDB Connected: ${conn.connection.host}`)
}

module.exports = connectDB