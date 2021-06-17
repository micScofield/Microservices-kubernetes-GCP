import {
  OrderCancelledEvent,
  Subjects,
  Listener,
  OrderStatus,
  NotFoundError
} from '@jainsanyam/common'

import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
  queueGroupName = queueGroupName

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // find order and set its status to cancelled

    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1 // we dont necessary require version check as we are dealing with status field nothing else but still...
    })

    if (!order) {
      throw new NotFoundError()
    }

    order.set({ status: OrderStatus.Cancelled })
    await order.save()

    msg.ack()
  }
}
