const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const bcrypt = require('bcryptjs')
const Repo = require('../repository')
const { protect } = require('../middleware/auth')

router.post('/', protect, async (req, res) => {
    try {
        const user = req.user
        const text = req.body.text

        // TODO: Validation

        const post = await Repo.createPost(user, text)

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

        // TODO: Validation

        console.log(postID, user.id, text)

        const post = await Post.findById(postID)
        const comment = await Repo.createCommentForPost(post, user, text)

        res.status(200).json(post)
    } catch (err) {
        console.log(err)
    }
})



module.exports = router