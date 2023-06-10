require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddleware = require('.//middlewares/error-middleware')

const PORT = process.env.PORT || 5200;

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use('/api', router)
app.use(errorMiddleware)

const start = () => {
  try {
    mongoose.connect(process.env.DB_URL)
    app.listen(PORT, () => console.log(`SERVER WORK ${PORT}`))
  } catch (e) {
    console.log(e)
  }
}

start()
