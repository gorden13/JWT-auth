
require('dotenv').config()

const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const cors = require('cors')

var corsOptions = {
  origin: '*'
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}



process.env.ACCESS_TOKEN_SECRET = '111'

const users = [{
    id: 1,
    email: 'writer@mail.ru',
    username: 'Васильев В.',
    password: 123456,
    role: 'writer'
  },
  {
    id: 2,
    email: 'reader@mail.ru',
    username: 'Петров П.',
    password: 123456,
    role: 'reader'
  }
]

let refreshTokens = []

var allowedOrigins = [
  'http://localhost:3000'
];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not ' +
        'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json())

app.get('/user', authenticateToken, (req, res) => {

  const user = users.find(user => user.username === req.user.name);

  const newUser = { user: { id: user.id, username: user.username, role: user.role } }

  res.json(newUser)
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

app.post('/token', (req, res) => {
  const refreshToken = req.body.token
  if (refreshToken == null) return res.sendStatus(401)
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    const accessToken = generateAccessToken({
      name: user.name
    })
    res.json({
      accessToken
    })
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
  res.json({
    accessToken: accessToken
  })
})

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 900
  })
}

app.listen(3001)