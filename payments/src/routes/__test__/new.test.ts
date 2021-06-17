import mongoose from 'mongoose'
import request from 'supertest'
import { OrderStatus } from '@jainsanyam/common'
import { app } from '../../app'
import { Order } from '../../models/order'
import { Payment } from '../../models/payment'
import { stripe } from '../../stripe'

// jest.mock('../../stripe') // commented as instead of mock, we are making actual call to stripe api

it('returns a 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asldkfj',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404)
})

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asldkfj',
      orderId: order.id,
    })
    .expect(401)
})

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: 'asdlkfj',
    })
    .expect(400)
})


// it('returns a 204 with valid inputs', async () => {
//   const userId = mongoose.Types.ObjectId().toHexString()
//   const order = Order.build({
//     id: mongoose.Types.ObjectId().toHexString(),
//     userId,
//     version: 0,
//     price: 20,
//     status: OrderStatus.Created,
//   })
//   await order.save()

//   await request(app)
//     .post('/api/payments')
//     .set('Cookie', global.signin(userId))
//     .send({
//       token: 'tok_visa', // this is a valid token for stripe test setup and will succeed each time
//       orderId: order.id
//     })
//     .expect(201)

//   // @ts-ignore
//   console.log(stripe.charges.create.mock.calls)

//   const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
//   expect(chargeOptions.source).toEqual('tok_visa')
//   expect(chargeOptions.amount).toEqual(20 * 100)
//   expect(chargeOptions.currency).toEqual('usd')
// })


// A more realistic approach

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 100)
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  })
  await order.save()
  console.log(order)
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)
  const stripeCharges = await stripe.charges.list({ limit: 50 })
  console.log(stripeCharges)
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100
  })

  expect(stripeCharge).toBeDefined()
  expect(stripeCharge!.currency).toEqual('usd')
})

it('creates a payment after successful transaction', async () => {
  const userId = mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 100)
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  })
  await order.save()
  console.log(order)
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)
  const stripeCharges = await stripe.charges.list({ limit: 50 })
  console.log(stripeCharges)
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100
  })

  expect(stripeCharge).toBeDefined()
  
  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  })

  expect(payment).not.toBeNull() // it is either null or paymentDoc, cant use toBeDefined() here
})
