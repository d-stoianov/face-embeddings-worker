import * as fs from 'fs/promises'
import mqConnection from './connection'

const queue = 'create_embeddings'

async function listenCreateEmbeddings() {
    await mqConnection.receive(queue, async (msg, channel) => {
        if (msg) {
            const response = JSON.parse(msg.content.toString())
            const { fileName, fileBinary } = response

            const fileBuffer = Buffer.from(fileBinary, 'base64')

            await fs.writeFile(`./tmp/${fileName}`, fileBuffer)

            // acknowledge message once embedding is created
            channel.ack(msg)
        }
    })
}

export default listenCreateEmbeddings
