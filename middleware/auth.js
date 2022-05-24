const jwt = require('jsonwebtoken')
const User = require('../models/user')

const userProtect = async function(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        console.log("No Token provided in cookies")
        redirectToLoginPage(res)
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id)
        if (!req.user) {
            console.log("No user found from jwtToken")
            redirectToLoginPage(res)
            return
        }
        next()
    } catch (error) {
        console.log("Couldn't verfiy token!")
        redirectToLoginPage(res)
    }
}

function redirectToLoginPage(res) {
    res.redirect('http://localhost:5000/login')
}

exports.adminOnlyProtect = async function(req, res, next) {
    userProtect(req, res, () => {
        if (!req.user.isAdmin()) {
            res.status(401).json({ error: 'Admin only page' })
            return
        }
        next()
    })
}


exports.protect = userProtect