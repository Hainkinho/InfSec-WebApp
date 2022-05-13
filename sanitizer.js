const sanitizeSql = require('mongo-sanitize')
const { sanitize } = require('express-xss-sanitizer');

const combinedSanitizer = (value) => {
    return sanitize(sanitizeSql(value))
}

module.exports = combinedSanitizer