const colors = require('colors')

const paramPollutionPreventer = (req, res, next) => {
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value == 'object') {
            console.log(`Paramter Pollution: key = ${key}, value = ${value}`.red)
            res.status(400).json({error: `Received too many values for same paramter: ${key}`})
            return
        }
    }
    next()
}

module.exports = paramPollutionPreventer