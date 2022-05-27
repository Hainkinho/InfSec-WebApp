
const shouldSanitize = process.env.NODE_ENV == "sanitized"

 const getUrl = function(endpointString) {
    let url = 'http://localhost:5000'
    if (shouldSanitize) {
        url = 'http://localhost:5050'
    }
    return url + endpointString
}

module.exports = getUrl 