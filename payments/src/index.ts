import mongoose from 'mongoose'

import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import { OrderCreatedListener } from './events/listeners/order-created-listener'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'

const start = async () => {

    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY env variable missing')
    }
    
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI env variable missing')
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID env variable missing')
    }

    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL env variable missing')
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID env variable missing')
    }

    if (!process.env.STRIPE_KEY) {
        throw new Error('STRIPE_KEY env variable missing')
    }

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL) 
        //cluster id is the one which we gave inside nats-depl file

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!')
            process.exit()
        })

        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())

        // listeners
        new OrderCreatedListener(natsWrapper.client).listen()
        new OrderCancelledListener(natsWrapper.client).listen()

        await mongoose.connect(
            process.env.MONGO_URI, 
            { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
        )
        
        console.log('db connected')
    } catch (err) {
        console.log(err)
    }
    app.listen(3000, () => console.log('Listening on port 3000'))
}
start()