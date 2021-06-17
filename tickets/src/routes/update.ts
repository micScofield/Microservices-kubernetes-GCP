import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  DatabaseConnectionError,
  BadRequestError
} from '@jainsanyam/common'

import { Ticket } from '../models/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if (!ticket) {
      throw new NotFoundError()
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    // check whether ticket is reserved or not
    if (ticket.orderId) {
      throw new BadRequestError('Ticket is reserved. Cannot edit now !')
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price,
    })
    
    try {
      await ticket.save()
    } catch (err) {
      throw new DatabaseConnectionError()
    }

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version
    })

    res.send(ticket)
  }
)

export { router as updateTicketRouter }