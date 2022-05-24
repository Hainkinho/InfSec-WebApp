const colors = require('colors')
const CustomError = require('../CustomError')

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

    res.status(500).json({error: err.message})
}

module.exports = errorHandler