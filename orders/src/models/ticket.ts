import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
// import { OrderStatus } from '@jainsanyam/common'

import { Order, OrderStatus } from './order'

interface TicketAttrs {
  title: string
  price: number
  id: string // we need to manually store the same ticket id which we listened during ticket-created event (for our tickets collection because we will refer the same id to ticket service upon order cancelled events etc.)
}

interface TicketDoc extends mongoose.Document {
  title: string
  price: number
  isReserved(): Promise<boolean>
  version: number
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc
  findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  }
)

// OCC
ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

//defined just to use ts features like when creating a ticket, we get hints on what it requires
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id, // because to set manual _id, we need to pass it ourselves. To allow passing of id inside other files, we are making this assignment here. Now in other files, we can build using { title, price, id } and no need for { title, price, _id: id }
    title: attrs.title,
    price: attrs.price
  })
}

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1
  })
}

/*
defining an isReserved method which we can use on order routes to check ticket status. If not using this feature, we would have to write out this logic in each route handler where we require the ticket status
Using function() {} because we need to access "this". 
"this" will refer to document which we will call .isReserved() on
*/
ticketSchema.methods.isReserved = async function() {
  const existingOrder = await Order.findOne({
    ticket: this.id, // this refers to document here, we need to find ticket by id
    status: {
      $in: [ OrderStatus.Created, OrderStatus.AwaitingPayment, OrderStatus.Complete ]
    }
  })

  if (existingOrder) return true

  return false
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema) //<document-type, model-type>

export { Ticket, TicketDoc }

/*
statics allows us to add method on model
methods allows us to add method on document
*/