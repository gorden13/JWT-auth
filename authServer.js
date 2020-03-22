require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')

process.env.REFRESH_TOKEN_SECRET = '123'
process.env.ACCESS_TOKEN_SECRET = '111'


const users = [{
    id: 1,
    email: 'writer@mail.ru',
    username: 'Васильев В.',
    password: 123456
  },
  {
    id: 2,
    email: 'reader@mail.ru',
    username: 'Петров П.',
    password: 123456
  }
]


app.use(express.json())

let refreshTokens = []

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({ name: user.name })
    res.json({ accessToken: accessToken })
  })
})

app.delete('/logout', (req, res) => {
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204)
})

app.post('/login', (req, res) => {
  // Authenticate User

  const email = req.body.email
  const password = req.body.password

  // const user = { name: email }
  const user = users.find(item => item.password === password && item.email === email)

  if (!user) {
    res.sendStatus(401)
    return false
  }

  const newUser = {
    name: user.username
  }
  const accessToken = generateAccessToken(newUser)
  // const refreshToken = jwt.sign(newUser, process.env.REFRESH_TOKEN_SECRET)
  // refreshTokens.push(refreshToken)
  res.json({ accessToken: accessToken })
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' })
}

app.listen(4000)