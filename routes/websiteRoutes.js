const express = require('express')
const router = express.Router()
const path = require('path');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user')
const DataMapper = require('../dataMapper')
const sanitize = require('../sanitizer')

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
            const postsRes = await mapPostsRelationsToObjArray(filteredPosts)
            res.render('feed', { username: user.name, query: query, posts: postsRes })
        } else {  
            const posts = await Post.find()
            const postsRes = await mapPostsRelationsToObjArray(posts)
            res.render('feed', { username: user.name, posts: postsRes, canEdit: false })
        }
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
        const postsRes = await mapPostsRelationsToObjArray(posts)
        res.render('feed', { username: user.name, posts: postsRes, canEdit: true })
    } catch (err) {
        console.log(err)
    }
})

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

async function mapPostsRelationsToObjArray(posts) {
    let postsRes = []
    for (const i in posts) {
        const res = await DataMapper.mapPostRelationsToObj(posts[i])
        postsRes.push(res)
    }
    return postsRes
}


module.exports = router