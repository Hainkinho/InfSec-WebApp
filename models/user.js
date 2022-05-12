const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

}, { timestamps: true })

userSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

const User = mongoose.model('User', userSchema)
module.exports = User
