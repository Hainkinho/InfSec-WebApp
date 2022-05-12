const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const bcrypt = require('bcryptjs')
const { protect } = require('../middleware/auth')

router.post('/', protect, async (req, res) => {
    try {
        const user = req.user
        const text = req.body.text

        const post = await new Post({
            userID: user.id,
            text: text,
            comments: []
        }).save()

        res.status(200).json(post)
    } catch (err) {
        console.log(err)
    }
})

router.post('/comment', protect, async (req, res) => {
    try {
        const postID = req.body.postID
        const user = req.user
        const text = req.body.text

        console.log(postID, user.id, text)

        const post = await Post.findById(postID)
        const comment = await new Comment({
            userID: user.id,
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