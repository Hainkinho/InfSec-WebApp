const jwt = require('jsonwebtoken')
const User = require('../models/user')

exports.protect = async function(req, res, next) {
    const token = req.cookies.token

    if (!token) {
        console.log("No Token provided in cookies")
        res.redirect('http://localhost:5000/login').status(400).json({error: "Cannot access feed when not logged in"})
        return
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // console.log("Token:", decoded)
        req.user = await User.findById(decoded.id)
        next()
    } catch (error) {
        res.redirect('http://localhost:5000/login').status(400).json({error: "Couldn't verfiy token!"})
    }
}