const { v4: uuidv4 } = require('uuid');

module.exports =  class CSRFTokenValidator {

    static _tokenMap = new Map()

    static generateID(user) {
        const id = uuidv4()
        const userID = user.id
        const expireDate = new Date(Date.now() + 10 * 60 * 1000)
        this._tokenMap.set(id, {expireDate, userID})
        return id
    }

    static isValid(id, user) {
        if (!id) { return false }
        if (!user) { return false }
        if (!this._tokenMap.has(id)) { return false }
        const { expireDate, userID } = this._tokenMap.get(id)
        if (expireDate < new Date()) { 
            this._tokenMap.delete(id)
            return false
        }
        if (user.id != userID) {
            return false
        }
        return true
    }
}