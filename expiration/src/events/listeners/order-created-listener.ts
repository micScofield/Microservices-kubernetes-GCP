import { Listener, OrderCreatedEvent, Subjects } from '@jainsanyam/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queueGroupName'
import { expirationQueue } from '../../queues/expiration-queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        // on listening to this event, add a job to queue (job object is somewhat similiar to msg inside node-streaming).

        const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
        console.log('Waiting ', delay, 'milliseconds to process')
        
        await expirationQueue.add({
            orderId: data.id
        }, {
            delay: delay //process this job after this much time (milliseconds)
        })

        msg.ack()
    }
}