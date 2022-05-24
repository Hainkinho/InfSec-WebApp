const Repo = require('../repository')
const { MongoMemoryServer } = require('mongodb-memory-server')
const { default: mongoose } = require('mongoose')
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')


let memoryServer

const connectDB = async () => {
    memoryServer = await MongoMemoryServer.create()
    const uri = await memoryServer.getUri()
    const mongooseOpts = {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    await mongoose.connect(uri, mongooseOpts)
    console.log("✅ Connected to Database")
}

const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key]
        await collection.deleteMany()
    }
}

const closeDB = async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    await memoryServer.stop()
    console.log("🔴 CLOSE")
}

beforeAll(async () => {
    return await connectDB()
})

beforeEach(async () => {
    await clearDB()
})

afterAll(async () => { 
    await closeDB
})


// MARK: - Unit Test

describe("Create User", () => {
    
    test('Test create User with empty strings', async () => {
        await expect(
            Repo.createUser("", "")
        ).rejects.toThrow()
    })
    
    test('Test create User with empty name', async () => {
        await expect(
            Repo.createUser("", "123")
        ).rejects.toThrow()
    })
    
    test('Test create User with empty password', async () => {
        await expect(
            Repo.createUser("flo", "")
        ).rejects.toThrow()
    })
    
    test('Test create User', async () => {
        await Repo.createUser("flo", "helloWORLD123!")
        const users = await User.find()
        expect(users.length).toBe(1)
    })
    
    test('Test create another User', async () => {
        await Repo.createUser("simon", "helloWORLD123!")
        const users = await User.find()
        expect(users.length).toBe(1)
    })

    test('Test create User with weak password', async () => {
        await expect(
            Repo.createUser("bob", "123")
        ).rejects.toThrow()
    })
})



describe("Create User", () => {
    test('Test create Post', async () => {
        const user = await getTestUser()
        const message = 'Hello World'

        const post = await Repo.createPost(user, message)

        expect(post).not.toBe(undefined)
        expect(post.text).toEqual(message)
        expect(post.userID == user.id).toEqual(true)

        const posts = await Post.find()
        expect(posts.length).toBe(1)
        expect(posts.length).toBe(1)
    })

    test('Test create Post with empty message string', async () => {
        const user = await getTestUser()
        await expect(
            Repo.createPost(user, '')
        ).rejects.toThrow()
    })

    test('Test create Post without user', async () => {
        await expect(
            Repo.createPost(null, '')
        ).rejects.toThrow()
    })
})


describe("Create User", () => {

    test('Test create Comment', async () => {
        const { user, post } = await getTestPostAndUser()
        const text = 'A Comment'

        const comment = await Repo.createCommentForPost(post, user, text)

        expect(comment.text).toEqual(text)
        expect(comment.userID == user.id).toEqual(true)
        expect(post.comments.includes(comment.id)).toEqual(true)
    })

    test('Test create Comment with empty message', async () => {
        const { user, post } = await getTestPostAndUser()

        await expect(
            Repo.createCommentForPost(post, user, '')
        ).rejects.toThrow()
    })
})


describe("Create User", () => {

    test('Test delete Post', async () => {
        const { user, post } = await getTestPostAndUser()
        const text = 'A Comment'

        const comment = await Repo.createCommentForPost(post, user, text)

        expect(comment.text).toEqual(text)
        expect(comment.userID == user.id).toEqual(true)
        expect(post.comments.includes(comment.id)).toEqual(true)
    })
})

test('Test delete post', async () => {
    const { user, post } = await getTestPostAndUser()
    const comment1 = await Repo.createCommentForPost(post, user, "first comment")
    const comment2 = await Repo.createCommentForPost(post, user, "second comment")
    const postID = post.id
    const commentID1 = comment1.id
    const commentID2 = comment2.id
    await Repo.deletePost(post)

    const deletedPost = await Post.findById(postID)
    const deletedComment1 = await Comment.findById(commentID1)
    const deletedComment2 = await Comment.findById(commentID2)

    expect(deletedPost).toEqual(null)
    expect(deletedComment1).toEqual(null)
    expect(deletedComment2).toEqual(null)
})



// MARK: - Helpers

const getTestUser = async () => {
    return await Repo.createUser("test", "helloWORLD123!")
}

const getTestPostAndUser = async () => {
    const user = await getTestUser()
    const post = await Repo.createPost(user, 'A message')
    return { user, post }
}