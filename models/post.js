const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const postSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        required: true
    },

    text: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 1000
    },

    comments: [Schema.Types.ObjectId]

}, { timestamps: true })

const Post = mongoose.model('Post', postSchema)
module.exports = Post
