import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { ExpirationCompleteEvent } from '@jainsanyam/common'

import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { natsWrapper } from '../../../nats-wrapper'
import { Order, OrderStatus } from '../../../models/order'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
    // create an instance of the listener
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    // create a ticket
    const ticket = Ticket.build({
        title: 'Movie',
        price: 19,
        id: mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    // create an order
    const order = Order.build({
        userId: 'afsfa',
        expiresAt: new Date(),
        status: OrderStatus.Created,
        ticket
    })
    await order.save()

    // create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // create a fake message object
    // @ts-ignore 
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg, order }
}

it('updates an order status to cancelled', async () => {
    const { listener, data, msg, order } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // write assertions to make sure a ticket was created!
    const updatedOrder = await Order.findById(order.id)

    expect(updatedOrder).toBeDefined()
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
    const { listener, data, msg, order } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])
    
    expect(eventData.id).toEqual(order.id)
})


it('acks the message', async () => {
    const { data, listener, msg } = await setup()

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg)

    // write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
})
