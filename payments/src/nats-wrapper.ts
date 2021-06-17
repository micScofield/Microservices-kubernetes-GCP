import nats, { Stan } from 'node-nats-streaming'

//acts as a singleton natsWrapper class (think of it like a mongoose singleton)
class NatsWrapper {
    private _client?: Stan //_client? tells that it may be undefined for some time.

    // this get thing is only available in TS. In other files, access this client using natsWrapper.client
    get client() {
        if (!this._client) {
            throw new Error('Cannot access nats client before connecting')
        }

        return this._client
    }

    connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url })

        return new Promise((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('Connected to NATS')
                resolve('')
            })

            this.client.on('error', (err) => {
                reject(err)
            })
        })
    }
}

export const natsWrapper = new NatsWrapper()
