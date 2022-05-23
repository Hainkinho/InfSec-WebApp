const { v4: uuidv4 } = require('uuid');

module.exports =  class CSRFTokenValidator {

    static _ids = []

    static generateID() {
        const id = uuidv4()
        this._ids.push(id)
        return id
    }

    static isValid(id) {
        if (!id) { return false }
        return this._ids.includes(id)
    }
}