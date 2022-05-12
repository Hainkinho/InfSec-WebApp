const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')

router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.sendFile('/websites/login.html')
        res.status(200).json(users)   
    } catch (err) {
        console.log(err)
    }
})

router.get("/test", async (req, res) => {
    const users = await User.find({ name: { $gt: "" } })
    console.log(users)
    res.status(200).json(users)
})

router.post('/login', async (req, res) => {
    try {
        const name = req.body.name
        const password = req.body.password
        
        const user = await User.findOne({ name: name })
        if (user == null) {
            res.status(404).json({})
            return
        }

        const match = await comparePassword(password, user.password)
        if (!match) {
            res.status(404).json({})
        } else {
            // res.status(200).json(user)
            console.log("redirect")
            res.redirect(`/feed/${user._id}`)

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

        const user = await new User({
            name: name,
            password: password
        }).save()
    
        res.status(200).json(user)   
    } catch (err) {
        console.log(err)
        res.status(400).json({})
    }
})

async function encrypt(password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

async function comparePassword(password1, password2) {
    return await bcrypt.compare(password1, password2)
}

router.get('/query/:query', async (req, res) => {
    const query = req.params.query
    const regex = new RegExp(query, 'i') // i for case insensitive

    console.log(query)

    const users = await User.find({ name: { $regex: regex } })
    res.status(200).json(users)
})


//console.log("Hello World")
//res.sendFile('leaderboard.html', {root: __dirname })

module.exports = router