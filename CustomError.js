

module.exports = class CustomError extends Error {
    customMessage
    statusCode

    constructor(statusCode = 500, customMessage = 'Error message unset') {
        super(customMessage);
        this.statusCode = statusCode
        this.customMessage = customMessage
    }
}