// we are listening this event because we need to update ticket data inside local tickets collection. Thus avoiding synchronous communication with other service for asking updated ticket data.

import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent, NotFoundError } from '@jainsanyam/common'

import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated
    queueGroupName = queueGroupName

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
        // find ticket inside tickets collection and update (Check for version as well so as to prevent concurrency issues)

        // const ticket = Ticket.findByIdAndUpdate(id, { $set: { title, price } }) this was used before static method findByEvent

        const ticket = await Ticket.findByEvent(data)
        if (!ticket) {
            throw new NotFoundError()
        }

        const { title, price } = data

        // make updates and save
        ticket.set({ title, price })
        await ticket.save()

        // publish an event to sync versions
        msg.ack()
    }
}
