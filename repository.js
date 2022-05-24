const mongoose = require('mongoose')
const User = require('./models/user')
const Post = require('./models/post')
const Comment = require('./models/comment')
const bcrypt = require('bcryptjs')
const CustomError = require('./CustomError')
const { passwordStrength } = require('check-password-strength')

module.exports = class Repository {

    static async getUser(name, password) {
        if (!name || name == "") { throw new CustomError("Name cannot be empty") }
        if (!password || password == "") { throw new CustomError("Password cannot be empty") }

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

    static async createUser(name, password) {
        if (!name || name == "") { throw new CustomError("Name cannot be empty") }
        if (!password || password == "") { throw new CustomError("Password cannot be empty") }
        if (!this.isStrongPassword(password)) { return }
        const encryptedPassword = await this.encrypt(password)
        return await new User({ name: name, password: encryptedPassword }).save()
    }

    static isStrongPassword(password) {
        const passwordObj = passwordStrength(password)
        const strength = passwordObj.id
        const msg = passwordObj.value
        if (strength <= 2) {
            throw new CustomError(msg + `! Current strength = ${strength}`)
        }
        return true
    }

    // TODO: write Unit Test
    static async updatePassword(user, newPassword) {
        const encryptedPassword = await this.encrypt(newPassword)
        user.password = encryptedPassword
        await user.save()
    }

    static async encrypt(password) {
        const salt = await bcrypt.genSalt(10)
        return bcrypt.hash(password, salt)
    }

    static async createPost(user, text) {
        if (!user) { throw Error("user is undefined") }
        if (!text || text == "") { throw Error("text is invalid") }
        return await new Post({ 
            userID: user.id, 
            text: text,
            comments: []
        }).save()
    }

    static async createCommentForPost(post, user, text) {
        if (!post) { throw Error('post is not defined') }
        if (!user) { throw Error('user is not defined') }
        if (!text || text == "") { throw Error('text is invalid') }
        const comment = await new Comment({ userID: user.id, text: text }).save()
        post.comments.push(comment)
        await post.save()
        return comment
    }

    static async deletePost(post) {
        if (!post) { throw Error("post is not defined") }
        
        for (const i in post.comments) {
            const commentID = post.comments[i]
            await Comment.findByIdAndDelete(commentID)
        }
        await Post.findByIdAndDelete(post.id)
    }

    static async deleteCommentFromPost(comment, post) {
        if (!comment) { throw Error("comment is not defined") }
        if (!post) { throw Error("post is not defined") }
        const commentID = comment.id
        await Comment.findByIdAndDelete(commentID)
        post.comments = post.comments.filter(id => { id != commentID })
    }

}