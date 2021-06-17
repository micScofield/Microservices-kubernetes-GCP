import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { NotFoundError, errorHandler, currentUser } from '@jainsanyam/common'

import { createChargeRouter } from './routes/new'

const app = express()
app.set('trust proxy', true)
app.use(json())

app.use(cookieSession({
    signed: false, //no encryption on cookie
    secure: process.env.NODE_ENV !== 'test' //send over https connection only
}))

app.use(currentUser)

// routes
app.use(createChargeRouter)

// 404
app.all('*', async (req, res, next) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }