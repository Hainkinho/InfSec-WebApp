const form = document.querySelector('form')
const loginBtn = document.querySelector('#login-btn')
const registerBtn = document.querySelector('#register-btn')
const nameTextField = document.getElementById('name-input')
const passwordTextField = document.getElementById('password-input')

form.addEventListener('submit', async e => {
    e.preventDefault()
})

loginBtn.addEventListener('click', async e => {
    console.log("login")
    const name = nameTextField.value
    const password = passwordTextField.value

    if (name == "" || password == "") {
        showError("Please fill out all required fields")
        return
    }

    const header = {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: name, password: password })
    }

    const res = await fetch('/api/users/login', header)

    if (res.status >= 200 && res.status < 300) {
        window.location.href = '/'
    } else {
        showError("Name and password don't match. Please try again...")
    }
})

registerBtn.addEventListener('click', async e => {
    console.log("register")
    const name = nameTextField.value
    const password = passwordTextField.value

    console.log(name, password)

    if (name == "" || password == "") {
        showError("Please fill out all required fields")
        return
    }

    const header = {
        method: 'POST',
        redirect: 'follow',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: name, password: password })
    }

    const res = await fetch('/api/users', header)
    if (res.status >= 200 && res.status < 300) {
        window.location.href = '/'
    } else {
        const json = await res.json()
        const errMessage = json.error
        showError(errMessage)
    }
})

function showError(message) {
    const errorEl = document.querySelector('#alert')
    errorEl.classList.remove("d-none")
    errorEl.innerHTML = message
}