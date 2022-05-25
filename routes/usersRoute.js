const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Repo = require('../repository')
const { protect } = require('../middleware/auth')
const CSRFTokenValidator = require('../CSRFValidator')
const CustomError = require('../CustomError')
const Repository = require('../repository')

const shouldSanitize = process.env.NODE_ENV == "sanitized"


router.post('/login', async (req, res, next) => {
    try {
        let name = req.body.name
        const password = req.body.password
        console.log('Name:', name, ',password: ', password)

        const user = await Repository.getUser(name, password)
        if(!user) {
            next(new CustomError(404, 'User not found!'))
            return 
        }
        const token = await user.getSignedJwtToken()
        redirectToFeed(res, 200, token)
    } catch (err) {
        next(err)
    }
})

// Logout
router.get('/logout', async (req, res, next) => {
    try {
        res.clearCookie("token").redirect('http://localhost:5000/login');
    } catch (err) {
        next(err)
    }
})

// Register
router.post('/', async (req, res, next) => {
    try {
        const name = req.body.name
        const password = req.body.password
        let role = req.body.role || 'user'

        if (shouldSanitize) {
            // When using the api only normal users can be created. In case of creating an admin, 
            // the server owner has to change the role by hand in the database!
            role = 'user'
        }

        const user = await Repo.createUser(name, password, role)
        const token = await user.getSignedJwtToken()
        redirectToFeed(res, 200, token)
    } catch (err) {
        next(err)
    }
})

router.patch('/update-password', protect, async (req, res, next) => {
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
            const match = await user.hasPassword(curPassword)
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
        next(err)
    }
})

router.get('/whoami', protect, async (req, res, next) => {
    try {
        if (req.user) {
            res.status(200).json(req.user)
            return
        }
        res.status(400).json({ error: 'User not found'})
    } catch(err) {
        next(err)
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


module.exports = router