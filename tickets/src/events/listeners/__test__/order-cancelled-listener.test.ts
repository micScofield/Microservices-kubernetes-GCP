import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { OrderCancelledEvent, OrderStatus } from '@jainsanyam/common'

import { OrderCancelledListener } from '../order-cancelled-listener'
import { natsWrapper } from '../../../nats-wrapper' // jest mocked import
import { Ticket } from '../../../models/ticket'

const setup = async () => {
    // create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client)

    // create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 29,
        userId: '123'
    })

    const orderId = mongoose.Types.ObjectId().toHexString()
    ticket.set({ orderId }) // not written in build because ticket updated interface expects an orderId not ticketCreatedEvent

    await ticket.save()

    // create a fake data event
    const data: OrderCancelledEvent['data'] = {
        version: 0,
        id: orderId,
        ticket: {
            id: ticket.id,
        }
    }

    // create a fake message object
    // @ts-ignore 
    const msg: Message = {
        ack: jest.fn(),
    }

    return { listener, data, msg, ticket, orderId }
}

it('sets the orderId of a ticket', async () => {
    const { listener, ticket, data, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // write assertions to make sure a ticket was created!
    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket).toBeDefined()
    expect(updatedTicket!.orderId).toBeUndefined()
})

it('acks the message', async () => {
    const { data, listener, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data, msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()

    // Mocking function arguments

    // Check whether publish was invoked with correct arguments or not
    // Tell jest that publish is a mock function 

    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]) // fetches the list of arguments as JSON. Do a console log to check what lies at [0] and so on. 

    expect(ticketUpdatedData.orderId).toBeUndefined() // dataId is the orderId
})