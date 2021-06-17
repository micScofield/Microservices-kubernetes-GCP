import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { NotFoundError, errorHandler, currentUser } from '@jainsanyam/common'

import { deleteOrderRouter } from './routes/delete'
import { indexOrderRouter } from './routes/index'
import { newOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'

const app = express()
app.set('trust proxy', true)
app.use(json())

app.use(cookieSession({
    signed: false, //no encryption on cookie
    secure: process.env.NODE_ENV !== 'test' //send over https connection only
}))

app.use(currentUser)

// Order Routes
app.use(deleteOrderRouter)
app.use(indexOrderRouter)
app.use(newOrderRouter)
app.use(showOrderRouter)

// 404
app.all('*', async (req, res, next) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }