import * as fs from 'fs/promises'
import mqConnection from './connection'
import EmbeddingsService from './EmbeddingsService'

const queue = 'create_embeddings'

async function listenCreateEmbeddings() {
    await mqConnection.receive(queue, async (msg, channel) => {
        if (msg) {
            console.log(`New message in the queue - ${queue}`)

            const response = JSON.parse(msg.content.toString())
            const { fileName, fileBinary } = response

            const fileBuffer = Buffer.from(fileBinary, 'base64')

            console.log(`Creating face embeddings for ${fileName} ...`)

            const faceEmbeddings = await EmbeddingsService.createFaceEmbeddings(
                fileBuffer
            )

            // if there are faces - write in in the json
            if (faceEmbeddings.length > 0) {
                await fs.writeFile(
                    `./tmp/${fileName}.json`,
                    JSON.stringify(faceEmbeddings)
                )
            }
            // no faces found
            else {
                console.error('No faces on the image')
            }

            // acknowledge message
            channel.ack(msg)
        }
    })
}

export default listenCreateEmbeddings
