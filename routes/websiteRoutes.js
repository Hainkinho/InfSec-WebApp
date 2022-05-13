const express = require('express')
const router = express.Router()
const path = require('path');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user')
const DataMapper = require('../dataMapper')
const sanitize = require('../sanitizer')

const { protect } = require('../middleware/auth')

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
            let posts = await Post.find()
            query = query.toLowerCase()

            let filteredPosts = []
            for (const i in posts) {
                const post = posts[i]
                if (post.text.toLowerCase().includes(query)) { 
                    filteredPosts.push(post)
                    continue
                }
                const user = await User.findById(post.userID)
                if (user && user.name.toLowerCase().includes(query)) {
                    filteredPosts.push(post)
                }
            }

            let postsRes = []
            for (const i in filteredPosts) {
                const res = await DataMapper.mapPostRelationsToObj(posts[i])
                postsRes.push(res)
            }
            res.render('feed', { username: user.name, query: query, posts: postsRes })
        } else {  
            const posts = await Post.find()
        
            if (user == null) {
                console.log("Error: User Empty")
                res.status(404).json({})       
            } else {
                let postsRes = []
                for (const i in posts) {
                    const res = await DataMapper.mapPostRelationsToObj(posts[i])
                    postsRes.push(res)
                }
                res.render('feed', { username: user.name, posts: postsRes })
            }
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({})
    }
})


module.exports = router