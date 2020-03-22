
require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

process.env.ACCESS_TOKEN_SECRET = '111'

app.use(express.json())

const users = [
  {
    id: 1,
    username: 'Васильев В.',
    role: 'writer'
  },
  {
    id: 2,
    username: 'Петров П.',
    role: 'reader'
  }
]

app.get('/user', authenticateToken, (req, res) => {
  res.json(users.filter(user => user.username === req.user.name))
})

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err)
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.listen(3001)