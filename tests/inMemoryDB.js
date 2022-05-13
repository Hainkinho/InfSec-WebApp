const { MongoMemoryServer } = require('mongodb-memory-server')
const { default: mongoose } = require('mongoose')

module.exports = class InMemoryDB {

    memoryServer

    constructor() {}

    async connectDB() {
        this.memoryServer = await MongoMemoryServer.create()
        const uri = await this.memoryServer.getUri()
        const mongooseOpts = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
        await mongoose.connect(uri, mongooseOpts)
        console.log("✅ Connected to Database")
    }

    async clearDB() {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key]
            await collection.deleteMany()
        }
    }

    async closeDB() {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
        await this.memoryServer.stop()
        console.log("🔴 CLOSE")
    }
}