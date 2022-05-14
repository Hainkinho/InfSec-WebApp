const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const bcrypt = require('bcryptjs')
const Repo = require('../repository')
const { protect, adminOnlyProtect } = require('../middleware/auth')
const sanitize = require('../sanitizer')

const shouldSanitize = process.env.NODE_ENV == "sanitized"

router.post('/', protect, async (req, res) => {
    try {
        const user = req.user
        let text = req.body.text

        if (shouldSanitize) {
            text = sanitize(text)
        }

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
        let text = req.body.text

        if (shouldSanitize) {
            text = sanitize(text)
        }

        console.log(postID, user.id, text)

        const post = await Post.findById(postID)
        const comment = await Repo.createCommentForPost(post, user, text)

        res.status(200).json(post)
    } catch (err) {
        console.log(err)
        res.status(400).json({})
    }
})

router.delete('/', adminOnlyProtect, async (req, res) => {
    try {
        const postID = req.body.postID

        if (!postID) {
            throw Error('postID not defined')
        }

        const post = await Post.findById(postID)
        await Repo.deletePost(post)

        res.status(200).json({ success: true})
    } catch (err) {
        console.log(err)
        res.status(400).json({})
    }
})


router.delete('/comment', adminOnlyProtect, async (req, res) => {
    try {
        const postID = req.body.postID
        const commentID = req.body.commentID

        if (!postID) {
            throw Error('postID not defined')
        } else if (!commentID) {
            throw Error('commentID not defined')
        }

        const post = await Post.findById(postID)
        const comment = await Comment.findById(commentID)
        await Repo.deleteCommentFromPost(comment, post)

        res.status(200).json({ success: true})
    } catch (err) {
        console.log(err)
        res.status(400).json({})
    }
})



module.exports = router