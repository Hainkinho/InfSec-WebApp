const jwt = require('jsonwebtoken')
const CustomError = require('../CustomError')
const User = require('../models/user')

const userProtect = async function(req, res, next) {
    const token = req.cookies.token
    const user = await getUserFromJWToken(token)
    if (!user) {
        redirectToLoginPage(res)
        return
    }
    req.user = user
    next()
}

exports.adminOnlyProtect = async function(req, res, next) {
    const token = req.cookies.token
    const user = await getUserFromJWToken(token)
    if (!user) {
        redirectToLoginPage(res)
        return
    }
    if (!user.isAdmin()) {
        next(new CustomError(401, 'Admin only'))
        return
    }
    req.user = user
    next()
}

function redirectToLoginPage(res) {
    res.redirect('http://localhost:5000/login')
}

async function getUserFromJWToken(token) {
    if (!token) {
        console.log("No Token provided in cookies")
        return null
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id)
        if (!user) {
            console.log("No user found from jwtToken")
            return null
        }
        return user
    } catch (error) {
        console.log("Couldn't verfiy token!")
        return null
    }
}


exports.protect = userProtect