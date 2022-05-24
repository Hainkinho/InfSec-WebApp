const { MongoMemoryServer } = require('mongodb-memory-server')
const { default: mongoose } = require('mongoose')
const User = require('../models/user')
const Post = require('../models/post')
const Comment = require('../models/comment')
const Repo = require('../repository')
const DataMapper = require('../dataMapper')
const InMemoryDB = require('./inMemoryDB')

const inMemoryDB = new InMemoryDB()

beforeAll(async () => {
    return await inMemoryDB.connectDB()
})

beforeEach(async () => {
    await inMemoryDB.clearDB()
})

afterAll(async () => { 
    await inMemoryDB.closeDB()
})



test('test mapPostRelationsToObj', async () => {
    const user = await Repo.createUser("a name", "helloWORLD123!")
    const post = await Repo.createPost(user, "A Post")
    const comment = await Repo.createCommentForPost(post, user, "A Comment")

    const postObj = await DataMapper.mapPostRelationsToObj(post)

    expect(postObj.text).toEqual("A Post")
    expect(postObj.user.name).toEqual(user.name)
    expect(postObj.user.name).toEqual(user.name)
    expect(postObj.comments.length).toEqual(1)
    expect(postObj.comments[0].user.name).toEqual(user.name)
    expect(postObj.comments[0].text).toEqual("A Comment")
})