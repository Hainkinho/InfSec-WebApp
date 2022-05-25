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

    role: {
        type: String,
        required: true,
        enum : ['user','admin'],
        default: 'user'
    }

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
    return this.role == 'admin'
}

userSchema.methods.toSanitizedObject = function() {
    let obj = this.toObject()
    delete obj.password
    delete obj.role
    return obj
}

const User = mongoose.model('User', userSchema)
module.exports = User
