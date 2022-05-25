const commentTextFields = document.getElementsByClassName("comment-field") 
const commentBtns = document.getElementsByClassName("comment-btn")
const commentBtnsArray = Array.from(commentBtns).filter(el => { return el.id != 'add-post-btn'})
const addPostBtn = document.getElementById("add-post-btn")

const deletePostBtns = document.getElementsByClassName('delete-post-btn')
const deleteCommentBtns = document.getElementsByClassName('delete-comment-btn')

// Setup EventListeners

Array.from(commentTextFields).forEach(el => {
    el.addEventListener('input', didUpdateTextField)
})

commentBtnsArray.forEach(el => {
    el.addEventListener('click', clickedCommentBtn)
})

if (addPostBtn) {
    addPostBtn.addEventListener('click', addPostBtnClicked)
}

Array.from(deletePostBtns).forEach(el => {
    el.addEventListener('click', deletePost)
})

Array.from(deleteCommentBtns).forEach(el => {
    el.addEventListener('click', deleteComment)
})


// Methods

function didUpdateTextField(e) {
    const textField = e.target
    const commentBtn = textField.parentElement.querySelector('.comment-btn')
    commentBtn.disabled = textField.value.length <= 0
}

async function clickedCommentBtn(e) {
    const btnEl = e.target
    const postContainerEl = btnEl.parentElement.parentElement
    const postID = postContainerEl.id
    const commentFieldEl = postContainerEl.querySelector('.comment-field')
    const text = commentFieldEl.value

    console.log(postID, text)

    const header = getHeader('POST', { postID: postID, text: text })
    const res = await fetch('http://localhost:5000/api/posts/comment', header)
    if (res.status >= 200 || res.status < 300) {
        window.location.reload();
    }
}

async function addPostBtnClicked(e) {
    const btnEl = e.target
    const postContainerEl = btnEl.parentElement.parentElement
    const commentFieldEl = postContainerEl.querySelector('.comment-field')
    const postText = commentFieldEl.value

    console.log(postText)

    const header = getHeader('POST', { text: postText })
    const res = await fetch('http://localhost:5000/api/posts', header)
    if (res.status >= 200 || res.status < 300) {
        window.location.reload();
    }
}

async function deletePost(e) {
    const deleteBtn = e.target
    const postContainerEl = deleteBtn.parentElement
    const postID = postContainerEl.id

    console.log(postID)

    const header = getHeader('DELETE', { postID: postID })
    const res = await fetch('http://localhost:5000/api/posts', header)
    if (res.status >= 200 || res.status < 300) {
        window.location.reload();
    }
}

async function deleteComment(e) {
    console.log("Delete Comment")
    const deleteBtn = e.target
    const commentID = deleteBtn.id
    const postContainerEl = deleteBtn.parentElement.parentElement
    const postID = postContainerEl.id
    console.log(postID, commentID)

    const header = getHeader('DELETE', { postID: postID, commentID: commentID })
    const res = await fetch('http://localhost:5000/api/posts/comment', header)
    if (res.status >= 200 || res.status < 300) {
        window.location.reload();
    }
}


// Helpers

function getHeader(httpMethode, jsonObj) {
    return {
        method: httpMethode,
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonObj)
    }
}