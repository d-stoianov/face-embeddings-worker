import * as dotenv from 'dotenv'
import * as amqp from 'amqplib'

dotenv.config()

async function main() {
    const connection = await amqp.connect(process.env.AMQP_URL || '')
    const channel = await connection.createChannel()

    const queue = 'my_queue'

    await channel.assertQueue(queue, { durable: false })

    channel.consume(queue, (msg) => {
        console.log(`Received msg: ${msg?.content.toString()}`)

        if (msg) {
            channel.ack(msg) // acknowledge msg
        }
    })
}

main()
