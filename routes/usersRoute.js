const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const Repo = require('../repository')
const sanitize = require('../sanitizer')

const shouldSanitize = process.env.NODE_ENV == "sanitized"


router.post('/login', async (req, res) => {
    try {
        let name = req.body.name
        const password = req.body.password

        console.log(name, password)

        if (shouldSanitize) {
            name = sanitize(name)
        }
        
        const user = await User.findOne({ name: name })
        if (user == null) {
            res.status(404).json({})
            return
        }

        const match = await comparePassword(password, user.password)
        if (!match) {
            res.status(404).json({})
        } else {
            const token = await createJwtToken(user)
            redirectToFeed(res, 200, token)
        }
    } catch (err) {
        console.log(err)
    }
})

// Logout
router.get('/logout', async (req, res) => {
    res.clearCookie("token").redirect('http://localhost:5000/login');
})

// Register
router.post('/', async (req, res) => {
    try {
        let name = req.body.name
        const password = req.body.password

        if (shouldSanitize) {
            name = sanitize(name)
        }

        console.log(req.body.password, password)

        const user = await Repo.createUser(name, password)
        const token = await createJwtToken(user)
        redirectToFeed(res, 200, token)
    } catch (err) {
        console.log(err)
        res.status(400).json({})
    }
})

async function createJwtToken(user) {
    return await user.getSignedJwtToken()
}

function redirectToFeed(res, statuscode, token) {
    let options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: false
    }

    if (shouldSanitize) {
        options.httpOnly = true // adds more security to cookie, so that within the browser javascript code cannot access it
    }

    console.log("Sending redirection link to feed view")
    res
        .cookie('token', token, options)
        .redirect('http://localhost:5000')
        .status(statuscode)
}

async function encrypt(password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

async function comparePassword(password1, password2) {
    return await bcrypt.compare(password1, password2)
}


module.exports = router