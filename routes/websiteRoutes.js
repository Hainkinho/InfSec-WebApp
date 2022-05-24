const express = require('express')
const router = express.Router()
const path = require('path');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user')
const DataMapper = require('../dataMapper')
const sanitize = require('../sanitizer')
const CSRFTokenValidator = require('../CSRFValidator')

const { protect, adminOnlyProtect } = require('../middleware/auth')

const shouldSanitize = process.env.NODE_ENV == "sanitized"

router.get('/login', async (req, res) => {
    const pathToFile = path.join(__dirname, '../views', 'login.html')
    res.sendFile(pathToFile)
})


// Feed
router.get('/', protect, async (req, res) => {
    try {
        let query = req.query.query
        const user = req.user

        if (shouldSanitize) {
            query = sanitize(query)
        }

        console.log("Query:", query)

        if (query) {
            const filteredPosts = await getFilteredPosts(query)
            sendFeed(res, filteredPosts, user.name, query)
        } else {  
            const posts = await Post.find()
            sendFeed(res, posts, user.name, null)
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({})
    }
})

// Reset Password
router.get('/reset-password', protect, async (req, res) => {
    try {
        const id = CSRFTokenValidator.generateID();
        res.render('reset-password', { id: id})
    } catch (err) {
        console.log(err)
        res.status(404).json({})
    }
})

// admin-only edit page
router.get('/edit', adminOnlyProtect, async (req, res) => {
    try {
        const user = req.user
        const posts = await Post.find()
        const canEdit = true
        sendFeed(res, posts, user.name, null, canEdit)
    } catch (err) {
        console.log(err)
    }
})

async function sendFeed(res, posts, username, query, canEdit = false) {
    posts.sort((a,b) => { 
        const aDate = new Date(a.createdAt)
        const bDate = new Date(b.createdAt)
        return bDate - aDate
    })
    const postsRes = await DataMapper.mapPostsRelationsToObjArray(posts)
    res.render('feed', { username: username, query: query, posts: postsRes, canEdit: canEdit })
}

async function getFilteredPosts(query) {
    let res = []
    const lowQuery = query.toLowerCase()
    let posts = await Post.find()
    for (const i in posts) {
        const post = posts[i]
        if (post.text.toLowerCase().includes(lowQuery)) { 
            res.push(post)
            continue
        }
        const user = await User.findById(post.userID)
        if (user && user.name.toLowerCase().includes(lowQuery)) {
            res.push(post)
        }
    }
    return res
}


module.exports = router