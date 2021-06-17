// publishing events from listener as well

import { Listener, OrderCreatedEvent, Subjects } from '@jainsanyam/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queue-group-name'
import { Order } from '../../models/order'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        /* Steps: specify what to do upon receiving an order created event
        1. extract fields from data, store it inside orders collection
        2. Send acknowledgement
        */

        const { id, status, userId, version, ticket: { price } } = data

        const order = Order.build({ id, status, userId, version, price })

        await order.save()

        msg.ack()
    }

}