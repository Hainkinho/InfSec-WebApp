const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const Repo = require('../repository')
const sanitize = require('../sanitizer')
const { protect } = require('../middleware/auth')
const CSRFTokenValidator = require('../CSRFValidator')
const CustomError = require('../CustomError')

const shouldSanitize = process.env.NODE_ENV == "sanitized"


router.post('/login', async (req, res) => {
    try {
        let name = req.body.name
        const password = req.body.password

        console.log(name, password)

        if (shouldSanitize) {
            name = sanitize(name)
        }
        
        // Approach so that we can show an Injections
        const users = await User.find({ name: name })
        
        for (const i in users) {
            const user = users[i]
            const match = await comparePassword(password, user.password)
            if (match) {
                const token = await user.getSignedJwtToken()
                redirectToFeed(res, 200, token)
                return    
            }
        }
        res.status(404).json({})
    } catch (err) {
        if (err instanceof CustomError) {
            console.log(err.customMessage)
            res.status(400).json({error: err.customMessage})    
            return
        }
        console.log(err)
        res.status(400).json({})
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

        const user = await Repo.createUser(name, password)
        const token = await user.getSignedJwtToken()
        redirectToFeed(res, 200, token)
    } catch (err) {
        console.log(err.message)
        res.status(400).json({error: err.message})
    }
})

router.patch('/update-password', protect, async (req, res) => {
    try {
        const user = req.user
        const curPassword = req.query.password
        const newPassword = req.query.newPassword
        const newPassword2 = req.query.newPassword2
        
        console.log(curPassword, newPassword, newPassword2)

        if (shouldSanitize) {
            const csrfToken = req.query.csrfToken
            if (!CSRFTokenValidator.isValid(csrfToken)) {
                console.log('🔴 Cross Site Request Forgery')
                res.status(400).json({ error: 'Invalid csrvToken' })
                return
            }
        }

        if (!curPassword || curPassword == '') {
            res.status(401).json({ error: 'No password sent' })
            return
        }

        // NOTE: Here is a vulnerability (Broken-Acces-Control ... Cross-Site Request Forgery & Paramter Pollution)
        // we only check whether the curPassword matches the old one if the curPassword is from type string. But what happens if the curPassword is from another type? For example if we pass multiple curPassword values, then express combines them in an array and thus the comparison wouldn't happen.

        if (typeof curPassword == 'string') {
            const match = await comparePassword(curPassword, user.password)
            if (!match) {
                res.status(401).json({ error: 'password does not match with current password' })
                return
            }
        }

        if (newPassword != newPassword2) {
            res.status(401).json({ error: 'new password must match with repeated one' })
            return
        }

        if (!newPassword || newPassword == '') {
            res.status(401).json({ error: 'No password sent' })
            return
        }

        await Repo.updatePassword(user, newPassword)
        res.status(200).json({ success: true })
    } catch (err) {
        console.log(err)
        res.status(400).json({})
    }
})

router.get('/whoami', protect, async (req, res) => {
    try {
        if (req.user) {
            res.status(200).json(req.user)
        }
        res.status(400).json({ error: 'User not found'})
    } catch(err) {
        console.log(err)
        res.status(400).json({})
    }
})


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
}

async function comparePassword(password1, password2) {
    return await bcrypt.compare(password1, password2)
}


module.exports = router