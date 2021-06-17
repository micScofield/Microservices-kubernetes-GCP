import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { NotFoundError, errorHandler } from '@jainsanyam/common'


import { currentUserRouter } from './routes/current-user'
import { signinRouter } from './routes/signin'
import { signoutRouter } from './routes/signout'
import { signupRouter } from './routes/signup'

const app = express()
app.set('trust proxy', true)
app.use(json())

app.use(cookieSession({
    signed: false, //no encryption on cookie
    secure: process.env.NODE_ENV !== 'test' //send over https connection only
}))

// User Routes
app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

// 404
app.all('*', async (req, res, next) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }