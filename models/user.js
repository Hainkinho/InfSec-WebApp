const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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

userSchema.methods.hasPassword = async function(password) {
    const match = await bcrypt.compare(password, this.password)
    return match
}

userSchema.methods.isAdmin = function() {
    return this.name == 'admin'
}

const User = mongoose.model('User', userSchema)
module.exports = User
