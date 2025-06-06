import firebaseApp from './config/firebase'
import mqConnection from './connection'
import EmbeddingsService from './EmbeddingsService'

const queue = 'create_embeddings'

async function listenCreateEmbeddings() {
    await mqConnection.receive(queue, async (msg, channel) => {
        if (msg) {
            console.log(`New message in the queue - ${queue}`)

            const response = JSON.parse(msg.content.toString())
            const { eventId, fileName } = response

            const fileBuffer = await firebaseApp.getFile(eventId, fileName)

            console.log(`Creating face embeddings for ${fileName} ...`)

            const faceEmbeddings = await EmbeddingsService.createFaceEmbeddings(
                fileBuffer
            )

            // no faces found
            if (faceEmbeddings.length <= 0) {
                console.error('No faces on the image')
            }

            await firebaseApp.storeEmbeddings(eventId, fileName, faceEmbeddings)

            // acknowledge message
            channel.ack(msg)
        }
    })
}

export default listenCreateEmbeddings
