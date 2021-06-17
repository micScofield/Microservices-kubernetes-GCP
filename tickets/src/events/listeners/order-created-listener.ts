// publishing events from listener as well

import { Listener, OrderCreatedEvent, Subjects, NotFoundError } from '@jainsanyam/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queue-group-name'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher' 

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        /* Steps: specify what to do upon receiving an order created event
        1. take ticket id from data, fetch the ticket using that id
        2. set orderid field inside ticket which indicates ticket is reserved
        3. Send acknowledgement
        */

        const ticketId = data.ticket.id
        const orderId = data.id

        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            throw new NotFoundError()
        }

        // await Ticket.updateOne({ _id: ticketId }, { $set: { orderId } })
        ticket.set({ orderId })
        await ticket.save()

        // emit(publish) an event so that tickets collection inside Order's service can also update its version and all services which are storing ticket versions can be in sync.

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        })

        msg.ack()
    }

}