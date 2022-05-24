const User = require('./models/user')
const Comment = require('./models/comment')

module.exports = class DataMapper {

    static async mapPostsRelationsToObjArray(posts) {
        if (!posts) { return [] }
        let postsRes = []
        for (const i in posts) {
            const res = await this.mapPostRelationsToObj(posts[i])
            postsRes.push(res)
        }
        return postsRes
    }

    static async mapPostRelationsToObj(post) {
        let postRes = post.toObject()
        const user = await User.findById(post.userID)
        postRes.user = user.toObject()
        const formattedCreationDateString = DataMapper.formatTime(post.createdAt)
        postRes.creationDateString = formattedCreationDateString
    
        let comments = []
        for (const i in post.comments) {
            const commentID = post.comments[i]
            const comment = await Comment.findById(commentID)
            if (!comment) { continue }
            const commentUser = await User.findById(comment.userID)
            let commentObj = comment.toObject()
            commentObj.user = commentUser.toObject()
            comments.push(commentObj)
        }
    
        postRes.comments = comments
        return postRes
    }

    static formatTime(dateString) {
        const date = new Date(dateString)
        const hours = this.convertToTwoDigits(date.getHours()) 
        const mins = this.convertToTwoDigits(date.getMinutes())

        if (this.isToday(date)) {
            return `Today - ${hours}:${mins}`
        }

        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        return `${day}.${month}.${year} - ${hours}:${mins}`
    }

    static isToday(date) {
        const now = new Date()
        return date.getDate() == now.getDate() && 
            date.getMonth() == now.getMonth() &&
            date.getFullYear() == now.getFullYear()
    }

    static convertToTwoDigits(num) {
        return num < 10 ? `0${num}` : num
    }
}