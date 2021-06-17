// we are listening this event because we need to update orders status to complete

import { Message } from 'node-nats-streaming'
import { Subjects, Listener, PaymentCreatedEvent, NotFoundError } from '@jainsanyam/common'

import { Order, OrderStatus } from '../../models/order'
import { queueGroupName } from './queue-group-name'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
    queueGroupName = queueGroupName

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {

        const { orderId } = data

        // find order and set its status to complete
        const order = await Order.findById(orderId)

        if (!order) {
            throw new NotFoundError()
        }

        order.set({ status: OrderStatus.Complete })
        await order.save()

        // we are not emitting another event here to notify others and syncing in the versions because once the order is complete we dont expect any further modifications to it. So no emitting is required, in case we want to be able to change order status even after completing, we should emit an event here and listen to this wherever required and increment the version.

        msg.ack()
    }
}
