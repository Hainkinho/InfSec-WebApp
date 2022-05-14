const jwt = require('jsonwebtoken')
const User = require('../models/user')

const userProtect = async function(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        console.log("No Token provided in cookies")
        redirectToLoginPage(res, 400, "Cannot access feed when not logged in!")
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id)
        if (!req.user) {
            redirectToLoginPage(res, 400, "Couldn't find user!")
            return
        }
        next()
    } catch (error) {
        redirectToLoginPage(res, 400, "Couldn't verfiy token!")
    }
}

function redirectToLoginPage(res, statusCode, errorMessage) {
    res.redirect('http://localhost:5000/login').status(statusCode).json({error: errorMessage})
}

exports.adminOnlyProtect = async function(req, res, next) {
    userProtect(req, res, () => {
        // TODO: check if user has admin role!
        if (req.user.name != 'SonGoku') {
            res.status(401).json({ error: 'Admin only page' })
            return
        }
        next()
    })
}


exports.protect = userProtect