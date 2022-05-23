

module.exports = class CustomError extends Error {
    customMessage

    constructor(customMessage) {
        super(customMessage);
        this.customMessage = customMessage
    }
}