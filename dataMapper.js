const User = require('./models/user')
const Comment = require('./models/comment')

module.exports = class DataMapper {
    static async mapPostRelationsToObj(post) {
        let postRes = post.toObject()
        const user = await User.findById(post.userID)
    
        const userObj = user.toObject()
        
        postRes.user = userObj
    
        let comments = []
        for (const i in post.comments) {
            const commentID = post.comments[i]
            const comment = await Comment.findById(commentID)
            if (!comment) { continue }
            const commentUser = await User.findById(comment.userID)
            const commentUserObj = commentUser.toObject()
            let commentObj = comment.toObject()
            commentObj.user = commentUserObj
            comments.push(commentObj)
        }
    
        postRes.comments = comments
        return postRes
    }
}