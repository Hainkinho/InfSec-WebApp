const sanitizeSql = require('mongo-sanitize')
const { sanitize } = require('express-xss-sanitizer');
var xss = require("xss");

const paramSanitizer = (req, res, next) => {
    for (const [key, value] of Object.entries(req.query)) {
        req.query[key] = sanitizeSql(xss(value))
    }
    console.log('Sanitized Query:', req.query)

    for (const [key, value] of Object.entries(req.body)) {
        req.body[key] = sanitizeSql(xss(value))
    }
    console.log('Sanitized Body:', req.body)
    next()
}

module.exports = paramSanitizer