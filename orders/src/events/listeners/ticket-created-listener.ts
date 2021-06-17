// we are listening this event because we need to store ticket data inside local tickets collection. Thus avoiding synchronous communication with other service for asking ticket data.

import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketCreatedEvent } from '@jainsanyam/common'

import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated
    queueGroupName = queueGroupName

    // on message, we want to store that ticket inside tickets collection
    async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
        // we need title and price out of data
        const { title, price, id } = data

        const ticket = Ticket.build({ id, title, price })
        await ticket.save()

        msg.ack()
    }
}
