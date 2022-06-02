const mongoose = require('mongoose')
const User = require('./models/user')
const Post = require('./models/post')
const Comment = require('./models/comment')
const bcrypt = require('bcryptjs')
const CustomError = require('./CustomError')
const { passwordStrength } = require('check-password-strength')

const shouldSanitize = process.env.NODE_ENV == "sanitized"

module.exports = class Repository {

    static async getUser(name, password) {
        if (!name || name == "") { throw new CustomError(400, "Name cannot be empty") }
        if (!password || password == "") { throw new CustomError(400, "Password cannot be empty") }

        // Approach so that we can show an Injections
        const users = await User.find({ name: name })
        
        for (const i in users) {
            const user = users[i]
            const match = await user.hasPassword(password)
            if (match) {
                return user
            }
        }
        return null
    }

    static async createUser(name, password, role) {
        if (!name || name == "") { throw new CustomError(400, "Name cannot be empty") }
        if (!password || password == "") { throw new CustomError(400, "Password cannot be empty") }
        if (shouldSanitize && !this.isStrongPassword(password)) { return }
        let newPassword = password
        if (shouldSanitize) {
            newPassword = await this.encrypt(password)
        }
        return await new User({
            name: name, 
            password: newPassword,
            role: role || 'user'
         }).save()
    }

    static isStrongPassword(password) {
        const passwordObj = passwordStrength(password)
        const strength = passwordObj.id
        const msg = passwordObj.value
        if (strength <= 2) {
            throw new CustomError(400, `${msg}! Current strength = ${strength}`)
        }
        return true
    }

    static async updatePassword(user, newPassword) {
        let password = newPassword
        if (shouldSanitize && !this.isStrongPassword(password)) { return }
        if (shouldSanitize) {
            password = await this.encrypt(newPassword)
        }
        user.password = password
        await user.save()
    }

    static async encrypt(password) {
        const salt = await bcrypt.genSalt(10)
        return bcrypt.hash(password, salt)
    }

    static async createPost(user, text) {
        if (!user) { throw new CustomError(500, "user is undefined") }
        if (!text || text == "") { throw new CustomError(400, "text is invalid") }
        return await new Post({ 
            userID: user.id, 
            text: text,
            comments: []
        }).save()
    }

    static async createCommentForPost(post, user, text) {
        if (!post) { throw new CustomError(500, 'post is not defined') }
        if (!user) { throw new CustomError(500, 'user is not defined') }
        if (!text || text == "") { throw CustomError(400, 'text is invalid') }
        const comment = await new Comment({ userID: user.id, text: text }).save()
        post.comments.push(comment)
        await post.save()
        return comment
    }

    static async deletePost(post) {
        if (!post) { throw new CustomError(500, "post is not defined") }
        
        for (const i in post.comments) {
            const commentID = post.comments[i]
            await Comment.findByIdAndDelete(commentID)
        }
        await Post.findByIdAndDelete(post.id)
    }

    static async deleteCommentFromPost(comment, post) {
        if (!comment) { throw new CustomError(500, "comment is not defined") }
        if (!post) { throw new CustomError(500, "post is not defined") }
        const commentID = comment.id
        await Comment.findByIdAndDelete(commentID)
        post.comments = post.comments.filter(id => { id != commentID })
    }

}