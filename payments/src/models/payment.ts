import mongoose from 'mongoose'

interface PaymentAttrs {
    orderId: string
    stripeId: string
}

interface PaymentDoc extends mongoose.Document {
    orderId: string
    stripeId: string
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc
}

const paymentSchema = new mongoose.Schema(
    {
        stripeId: {
            type: String,
            required: true,
        },
        orderId: {
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

// No need for versions as this collection might never get any updates 
// paymentSchema.set('versionKey', 'version')
// paymentSchema.plugin(updateIfCurrentPlugin)

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment({
        orderId: attrs.orderId,
        stripeId: attrs.stripeId
    })
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema)

export { Payment }
