import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import { validateRequest, BadRequestError, DatabaseConnectionError } from '@jainsanyam/common'

import { Password } from '../utilities/password'
import { User } from '../models/user'

const router = express.Router()

router.post(
    '/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a valid password !')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body

        let existingUser
        try {
            existingUser = await User.findOne({ email })
        } catch (err) {
            throw new DatabaseConnectionError()
        }

        if (!existingUser) {
            throw new BadRequestError('Invalid Credentials')
        }

        let passwordsMatch
        try {
            passwordsMatch = await Password.compare(existingUser.password, password)
        } catch (err) {
            throw new DatabaseConnectionError()
        }

        if (!passwordsMatch) {
            throw new BadRequestError('Invalid Credentials')
        }

        // Generate JWT
        const userToken = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email
            },
            process.env.JWT_KEY!
        )

        // attach token to session object
        req.session = { jwt: userToken }

        return res.status(200).send(existingUser)
    }
)

export { router as signinRouter }
