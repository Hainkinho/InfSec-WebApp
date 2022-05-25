const { v4: uuidv4 } = require('uuid');

module.exports =  class CSRFTokenValidator {

    static _ids = new Map()

    static generateID() {
        const id = uuidv4()
        const expireDate = new Date(Date.now() + 10 * 60 * 1000)
        this._ids.set(id, expireDate)
        return id
    }

    static isValid(id) {
        if (!id) { return false }
        if (!this._ids.has(id)) { return false }
        const expireDate = this._ids.get(id)
        if (expireDate < new Date()) { 
            this._ids.delete(id)
            return false
        }
        return true
    }
}