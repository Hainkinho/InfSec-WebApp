const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userID: {
        type: Schema.Types.ObjectId,
        required: true
    },

    text: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 300
    },

}, { timestamps: true })

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment
