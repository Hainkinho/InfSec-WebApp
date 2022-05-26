const colors = require('colors')
const CustomError = require('../CustomError')

const shouldSanitize = process.env.NODE_ENV == "sanitized"

const errorHandler = (err, req, res, next) => {
    console.log(err.stack.red.bold)
    if (err instanceof CustomError) {
        console.log(colors.red(err.statusCode).bold, err.customMessage)
        res.status(err.statusCode).json({error: err.customMessage})    
        return
    }

    // MongoDB ObjectID convertion failure
    if (err.kind == 'ObjectId') {
        res.status(400).json({error: 'Could not find object with provided id'})    
        return
    }

    if (shouldSanitize) {
        // This protects the server from leaking implementation details of yet unknown errors.
        res.status(500).json({error: 'Something went wrong'})
    } else {
        res.status(500).json({error: err.message})
    }
}

module.exports = errorHandler