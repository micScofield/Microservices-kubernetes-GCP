import express, { Request, Response } from 'express'
import { requireAuth } from '@jainsanyam/common'
import { Order } from '../models/order'

const router = express.Router()

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {

  // find orders of the loggedIn user
  const orders = await Order.find({ userId: req.currentUser!.id }).populate('ticket')

  res.send(orders)
})

export { router as indexOrderRouter }
