import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { validateRequest, BadRequestError, DatabaseConnectionError } from '@jainsanyam/common'

import { User } from '../models/user'

const router = express.Router()

router.post(
    '/api/users/signup',
    [
        body('email').isEmail().withMessage('Invalid Email !'),
        body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 and 20 characters')
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const { email, password } = req.body

        let existingUser
        try {
            existingUser = await User.findOne({ email }, { email: 1 })
        } catch (err) {
            throw new DatabaseConnectionError()
        }

        if (existingUser) {
            throw new BadRequestError('Email address is already in use. Please try signing in or sign up with a new email !')
        }

        // save user
        let user
        try {
            user = await User.build({ email, password }).save()
        } catch (err) {
            throw new DatabaseConnectionError()
        }

        // generate token
        const userToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_KEY!
        )

        // attach token to session object
        req.session = { jwt: userToken }
        return res.status(201).send({ user: user.email })
    }
)

export { router as signupRouter }