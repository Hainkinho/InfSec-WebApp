const express = require('express')
const router = express.Router()
const path = require('path');
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user')

router.get('/login', async (req, res) => {
    console.log("Hello World")

    const pathToFile = path.join(__dirname, '../views', 'login.html')
    res.sendFile(pathToFile)
})

router.get('/', async (req, res) => {
    const pathToFile = path.join(__dirname, '../views', 'game.html')
    res.sendFile(pathToFile)
})

router.get('/feed/:userID', async (req, res) => {
    try {
        const query = req.query.query.toLowerCase()

        if (query) {
            const regex = new RegExp(query, 'i') // i for case insensitive
            let posts = await Post.find()

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
                const res = await convertPostToJsonRepsonse(filteredPosts[i])
                postsRes.push(res)
            }
            res.render('feed', { query: query, posts: postsRes })
        } else {
            const userID = req.params.userID    
            const posts = await Post.find()
        
            const user = await User.findOne({ _id: userID })
            if (user == null) {
                res.status(404).json({})       
            } else {
                const users = await User.find()
                let postsRes = []
                for (const i in posts) {
                    const res = await convertPostToJsonRepsonse(posts[i])
                    postsRes.push(res)
                }
                res.render('feed', { users: users, posts: postsRes })  
            }
        }
    } catch (err) {
        console.log(err)
        res.status(404).json({})
    }
})

async function convertPostToJsonRepsonse(post) {
    let postRes = {}
    const user = await User.findById(post.userID)

    postRes.id = post._id
    postRes.author = user.name
    postRes.text = post.text

    let comments = []
    for (const i in post.comments) {
        const commentID = post.comments[i]
        const comment = await Comment.findById(commentID)
        if (!comment) { continue }
        const commentUser = await User.findById(comment.userID)
        comments.push({
            author: commentUser.name,
            text: comment.text
        })
    }

    postRes.comments = comments
    return postRes
}

module.exports = router