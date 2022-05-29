const express = require('express')
const router = express.Router()
const path = require('path');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user')
const DataMapper = require('../dataMapper')
const CSRFTokenValidator = require('../CSRFValidator')

const { userOnlyProtect, adminOnlyProtect } = require('../middleware/auth')

const shouldSanitize = process.env.NODE_ENV == "sanitized"

router.get('/login', async (req, res, next) => {
    try {
        const pathToFile = path.join(__dirname, '../views', 'login.html')
        res.sendFile(pathToFile)   
    } catch (error) {
        next(err)
    }
})


// Feed
router.get('/', userOnlyProtect, async (req, res, next) => {
    try {
        let query = req.query.query
        const user = req.user
        console.log("Query:", query)

        if (query) {
            const filteredPosts = await getFilteredPosts(query)
            sendFeed(res, filteredPosts, user.name, user.isAdmin(), query)
        } else {  
            const posts = await Post.find()
            sendFeed(res, posts, user.name, user.isAdmin(), null)
        }
    } catch (err) {
        next(err)
    }
})

// Reset Password
router.get('/reset-password', userOnlyProtect, async (req, res, next) => {
    try {
        const id = CSRFTokenValidator.generateID(req.user);
        res.render('reset-password', { id: id})
    } catch (err) {
        next(err)
    }
})


if (shouldSanitize) {
    router.get('/edit', adminOnlyProtect, editWebsiteEndpointMethod)
} else {
    router.get('/edit', userOnlyProtect, editWebsiteEndpointMethod)
}

async function editWebsiteEndpointMethod(req, res, next) {
    try {
        const user = req.user
        const posts = await Post.find()
        const canEdit = true
        sendFeed(res, posts, user.name, user.isAdmin(), null, canEdit)
    } catch (err) {
        next(err)
    }
}

async function sendFeed(res, posts, username, isAdmin, query, canEdit = false) {
    posts.sort((a,b) => { 
        const aDate = new Date(a.createdAt)
        const bDate = new Date(b.createdAt)
        return bDate - aDate
    })
    const postsRes = await DataMapper.mapPostsRelationsToObjArray(posts)
    res.render('feed', { username: username, query: query, posts: postsRes, canEdit: canEdit, isAdmin: isAdmin })
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