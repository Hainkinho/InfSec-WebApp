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
        await Repo.createUser("flo", "123")
        const users = await User.find()
        expect(users.length).toBe(1)
    })
    
    test('Test create another User', async () => {
        await Repo.createUser("simon", "test")
        const users = await User.find()
        expect(users.length).toBe(1)
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
        const { user, post } = await getTestCommentAndUser()
        const text = 'A Comment'

        const comment = await Repo.createCommentForPost(post, user, text)

        expect(comment.text).toEqual(text)
        expect(comment.userID == user.id).toEqual(true)
        expect(post.comments.includes(comment.id)).toEqual(true)
    })

    test('Test create Comment with empty message', async () => {
        const { user, post } = await getTestCommentAndUser()

        await expect(
            Repo.createCommentForPost(post, user, '')
        ).rejects.toThrow()
    })
})



// MARK: - Helpers

const getTestUser = async () => {
    return await Repo.createUser("test", "123")
}

const getTestCommentAndUser = async () => {
    const user = await getTestUser()
    const post = await Repo.createPost(user, 'A message')
    return { user, post }
}