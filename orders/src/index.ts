import mongoose from 'mongoose'

import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import { TicketCreatedListener } from './events/listeners/ticket-created-listener'
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener'
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener'
import { PaymentCreatedListener } from './events/listeners/payment-created-listener'

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

    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL) 
        //cluster id is the one which we gave inside nats-depl file

        // exit process on a "close" event
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!')
            process.exit()
        })
        
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())

        // listening for incoming events
        new TicketCreatedListener(natsWrapper.client).listen()
        new TicketUpdatedListener(natsWrapper.client).listen()
        new ExpirationCompleteListener(natsWrapper.client).listen()
        new PaymentCreatedListener(natsWrapper.client).listen()

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