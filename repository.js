const mongoose = require('mongoose')
const User = require('./models/user')
const Post = require('./models/post')
const Comment = require('./models/comment')
const bcrypt = require('bcryptjs')

module.exports = class Repository {

    static async createUser(name, password) {
        if (!name || name == "") { throw Error("Name cannot be empty") }
        if (!password || password == "") { throw Error("Password cannot be empty") }
        const encryptedPassword = await Repository.encrypt(password)
        return await new User({ name: name, password: encryptedPassword }).save()
    }

    // TODO: Move methode to another class - maybe inside user as a static methode
    static async encrypt(password) {
        const salt = await bcrypt.genSalt(10)
        return bcrypt.hash(password, salt)
    }

    static async createPost(user, text) {
        if (!user) { throw Error("user is undefined") }
        if (!text || text == "") { throw Error("text is invalid") }
        return await new Post({ userID: user.id, text: text }).save()
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

}