
const shouldSanitize = process.env.NODE_ENV == "sanitized"

 const getUrl = function(endpointString) {
    const url = 'http://localhost:' + (shouldSanitize ? '5050' : '5000')
    return url + endpointString
}

module.exports = getUrl 