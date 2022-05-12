const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const bcrypt = require('bcryptjs')

router.post('/', async (req, res) => {
    try {
        const userID = req.body.userID
        const text = req.body.text

        console.log(userID, text)

        const post = await new Post({
            userID: userID,
            text: text,
            comments: []
        }).save()

        const postRes = convertPostToJsonRepsonse(post)
        res.status(200).json(postRes)
    } catch (err) {
        console.log(err)
    }
})

router.post('/comment', async (req, res) => {
    try {
        const postID = req.body.postID
        const userID = req.body.userID
        const text = req.body.text

        console.log(postID, userID, text)

        const post = await Post.findById(postID)
        const comment = await new Comment({
            userID: userID,
            text: text
        }).save()

        post.comments.push(comment._id)
        await post.save()

        res.status(200).json(post)
    } catch (err) {
        console.log(err)
    }
})



module.exports = router