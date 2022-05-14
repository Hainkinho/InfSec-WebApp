A small university project to demonstrate brutal information security attacks on an innocent server. Our main focus for this project was to show off one of the biggest web server vulnerabilities - injections as well as broken access control.

# Requirements

To run the server you need to have node installed:
https://nodejs.org/en/download/

Check if the installation was successful by typing ... 
```bash
node -v

npm -v
```
... in the command line. Both commands should show you the currently installed version number.

# Building

```bash
# Start the server
npm run start

# Start the server with automatic sanitizing user inputs
npm run sanstart

# Start the server and watch for changes
npm run dev

# Run Unit Tests
npm test
```

# Run Web App
After you have started the server successfully you can finally check out the web app. Just type in http://localhost:5000/ in your browser. The recommended browser is Chrome, because it supports most of the CSS features and it's the only browser I have tested the web app.

### Endpoints

| Endpoint  |  Description |
|:-:|:-:|
| /  | Feed Page |
| /login  | Login Page |
| /edit  | Feed Page **(admin-only)**, where he can delete posts/comments |

# Useful commands
Be careful with it!

```bash
# Add default entries
node seeder add

# Delete all entries from the database
node seeder delete
```


# Login 

### Admin

| Name  |  Password |
|:-:|:-:|
| admin  | admin |

### Normal User
| Name  |  Password |
|:-:|:-:|
| taylor_swift  | love  |
| carlito_love  | test  |
| buddha_knows  | test  |
| flo  | test  |
| natalie  | test  |
| joachim  | test  |
| elena  | test  |

