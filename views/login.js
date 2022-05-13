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

    const url = `http://localhost:5000/api/users/login`
    console.log(url)
    const res = await fetch(url, header)

    if (res.redirected) {
        window.location.href = res.url
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

    const res = await fetch('http://localhost:5000/api/users', header)
    if (res.redirected) {
        window.location.href = res.url
    } else {
        showError("Name and password don't match. Please try again...")
    }
})

function showError(message) {
    const errorEl = document.querySelector('#alert')
    errorEl.classList.remove("d-none")
    errorEl.innerHTML = message
}