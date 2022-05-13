const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const Repo = require('../repository')

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.status(200).json(users)   
    } catch (err) {
        console.log(err)
    }
})

router.post('/login', async (req, res) => {
    try {
        const name = req.body.name
        const password = req.body.password

        console.log(name, password)
        
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

// Register
router.post('/', async (req, res) => {
    try {
        const name = req.body.name
        const password = await encrypt(req.body.password)
        console.log(req.body.password, password)

        const user = Repo.createUser(name, password)
    
        const token = await createJwtToken(user)
        console.log(token)
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
    // TODO: SECURITY: Set httpOnly to true, so that javascript cannot access the cookie from within the browser!
    const options = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        // httpOnly: true
    }

    console.log("Redirect to /")
    res.status(statuscode).cookie('token', token, options).redirect(`/`)
}

async function encrypt(password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

async function comparePassword(password1, password2) {
    return await bcrypt.compare(password1, password2)
}


module.exports = router