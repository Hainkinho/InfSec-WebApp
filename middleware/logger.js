const colors = require('colors')

const logger = (req, res, next) => {
    console.log(req.method.green.bold, req.url)
    next()
}

module.exports = logger