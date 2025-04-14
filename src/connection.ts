import client, { ChannelModel, Channel } from 'amqplib'
import { AMQP_URL } from './config'

class RabbitMQConnection {
    private connection!: ChannelModel
    private channel!: Channel

    public async connect() {
        try {
            this.connection = await client.connect(AMQP_URL)
            this.channel = await this.connection.createChannel()
        } catch (error) {
            console.error('Error connecting to RabbitMQ')
            throw error
        }
    }

    public async receive(
        queue: string,
        onMessage: (msg: client.ConsumeMessage | null, channel: Channel) => void
    ) {
        await this.channel.assertQueue(queue, {
            durable: true,
        })

        try {
            this.channel.consume(queue, (msg) => {
                onMessage(msg, this.channel)
            })
        } catch (error) {
            console.error(`Error receiving message from queue - ${queue}`)
            throw error
        }
    }
}

const mqConnection = new RabbitMQConnection()
export default mqConnection
