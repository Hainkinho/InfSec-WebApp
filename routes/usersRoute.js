const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const Repo = require('../repository')
const sanitize = require('../sanitizer')
const { protect } = require('../middleware/auth')

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

        const user = await Repo.createUser(name, password)
        const token = await user.getSignedJwtToken()
        redirectToFeed(res, 200, token)
    } catch (err) {
        console.log(err)
        res.status(400).json({})
    }
})

router.patch('/update-password', protect, async (req, res) => {
    try {
        const user = req.user
        const curPassword = req.body.curPassword
        const newPassword = req.body.newPassword
        const newPassword2 = req.body.newPassword2

        // NOTE: Here is a vulnerability (Broken-Acces-Control ... Cross-Site Request Forgery)
        // we only check if the curPassword matches the old one. But if the user does not provide a curPassword in the request, then this check doesn't happen!

        if (curPassword) {
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