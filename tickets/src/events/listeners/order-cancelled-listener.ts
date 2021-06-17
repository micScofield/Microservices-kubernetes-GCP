// publishing events from listener as well

import { Listener, OrderCancelledEvent, Subjects, NotFoundError } from '@jainsanyam/common'
import { Message } from 'node-nats-streaming'

import { queueGroupName } from './queue-group-name'
import { Ticket } from '../../models/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher' 

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
    queueGroupName = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        /* Steps: specify what to do upon receiving an order cancelled event
        1. take ticket id from data, fetch the ticket using that id
        2. set orderid field inside ticket which indicates ticket is reserved. Dont make it null, make it undefined because TS wants optional values to be either undefined or defined.
        3. Send acknowledgement
        */

        const ticketId = data.ticket.id

        const ticket = await Ticket.findById(ticketId)

        if (!ticket) {
            throw new NotFoundError()
        }

        ticket.set({ orderId: undefined }) // null implies that ticket-owner can now make edits to this ticket
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