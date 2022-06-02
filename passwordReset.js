const dotenv = require('dotenv')
const mongoose = require('mongoose')
const User = require('./models/user')
const bcrypt = require('bcryptjs')

dotenv.config({ path: './config/config.env'})

const username = process.argv[2]
const newPassword = process.argv[3]

if (!username) {
    throw 'Please add a user name'
}

if (!newPassword) {
    throw 'Please add a password'
}

const dbURI = process.env.MONGO_URI_SANITIZED

mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})



async function main() {
    const user = await User.findOne({name: username})
    const encryptedPassword = await encrypt(newPassword)
    user.password = encryptedPassword
    await user.save()

    process.exit()
}

async function encrypt(password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
}

main()

