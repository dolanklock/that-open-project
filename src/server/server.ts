const express = require("express")
const app = express()

interface IUsers {
    username: string,
    password: string,
}

// users would be stored in DB but for testing purposes
// this is fine
const users: IUsers[] = [{username: "billy", password: "43r3r4f"}]

// creating our route for app to listen
app.get('/users', (req, res) => {
    res.json(users)
})

app.listen(5174)