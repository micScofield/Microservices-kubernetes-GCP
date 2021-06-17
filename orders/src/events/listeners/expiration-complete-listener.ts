import { Message } from 'node-nats-streaming'
import { Subjects, Listener, ExpirationCompleteEvent, NotFoundError } from '@jainsanyam/common'

import { Order, OrderStatus } from '../../models/order'
import { queueGroupName } from './queue-group-name'
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
    queueGroupName = queueGroupName

    // on message, we want to cancel that order
    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        // we need orderId out of data
        const { orderId } = data

        // find order from db and mark it as cancelled
        const order = await Order.findById(orderId).populate('ticket')

        if (!order) {
            throw new NotFoundError()
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack()
        }

        order.set({ status: OrderStatus.Cancelled })
        await order.save()

        // publish order cancelled event
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        msg.ack()
    }
}
