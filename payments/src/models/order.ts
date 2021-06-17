import mongoose from 'mongoose'
import { OrderStatus } from '@jainsanyam/common'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

interface OrderAttrs {
  status: OrderStatus
  price: number
  userId: string
  id: string
  version: number
}

interface OrderDoc extends mongoose.Document {
  status: OrderStatus
  price: number
  userId: string
  version: number
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc
}

const orderSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus), // In JS, we dont have enums, so we can pass a freezed object as an argument
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
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

orderSchema.set('versionKey', 'version')
orderSchema.plugin(updateIfCurrentPlugin)

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status
  })
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema)

export { Order }
