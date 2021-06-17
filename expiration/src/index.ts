import { natsWrapper } from './nats-wrapper'

import { OrderCreatedListener } from './events/listeners/order-created-listener'

const start = async () => {

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

        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!')
            process.exit()
        })

        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())

        // listeners
        new OrderCreatedListener(natsWrapper.client).listen()

    } catch (err) {
        console.log(err)
    }
}
start()