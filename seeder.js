const dotenv = require('dotenv')
const mongoose = require('mongoose')
const User = require('./models/user')
const Post = require('./models/post')
const Comment = require('./models/comment')
const Repo = require('./repository')

dotenv.config({ path: './config/config.env'})


mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true
})

const deleteData = async () => {
    await Comment.deleteMany()
    await Post.deleteMany()
    await User.deleteMany()
    process.exit()
}

const addData = async () => {
    const carlitoLove = await Repo.createUser("carlito_love", "test")
    const taylor_swift = await Repo.createUser("taylor_swift", "love")
    const buddha_knows = await Repo.createUser("buddha_knows", "test")
    const flo = await Repo.createUser("flo", "test")
    const natalie = await Repo.createUser("natalie", "test")
    const joachim = await Repo.createUser("joachim", "test")
    const elena = await Repo.createUser("elena", "test")
    const admin = await Repo.createUser("admin", "admin")

    const post1 = await Repo.createPost(taylor_swift, "No matter what happens in life, be good to people. Being good to people is a wonderful legacy to leave behind.")

    const post2 = await Repo.createPost(carlitoLove, "Doch ich wollt eigentlich unendlichkeit. I remember this for life, and now I can see much clearer. I\'m never scared to dye, cause I can live forever. I will be alive, in this moment. For eternety")

    const post3 = await Repo.createPost(buddha_knows, "No one saves us but ourselves. No one can and no one may. We ourselves must walk the path.")

    const post4 = await Repo.createPost(carlitoLove, "What happens bevor you were born. Are things fake or are they tru? The true you doesn't even exist yet - so maybe everything is fake, or maybe everything is the most true and being alive is fake. Maybe it is fake and true at the same time. - fake you, stay tru")

    await Repo.createCommentForPost(post1, carlitoLove, 'Couldn\'t say it any better')
    await Repo.createCommentForPost(post1, taylor_swift, 'Thanks Carlo')

    process.exit()
}

if (process.argv[2] == "delete") {
    deleteData()
    console.log("Data destroyed")
} else if(process.argv[2] == "add") {
    addData()
    console.log("Data added")
} else {
    console.log("Nothing")
    process.exit()
}