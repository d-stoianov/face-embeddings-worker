import * as fs from 'fs/promises'
import mqConnection from './connection'
import EmbeddingsService, { FaceEmbedding } from './EmbeddingsService'

const queue = 'compare_embeddings'

async function listenCompareEmbeddings() {
    await mqConnection.receive(queue, async (msg, channel) => {
        if (msg) {
            console.log(`New message in the queue - ${queue}`)

            const response = JSON.parse(msg.content.toString())
            const { srcFileName, destFileNames } = response

            const srcFaceEmbeddingsRaw = await fs.readFile(
                `./tmp/${srcFileName}.json`,
                'utf8'
            )
            // take first face
            const srcFaceEmbedding: FaceEmbedding =
                JSON.parse(srcFaceEmbeddingsRaw)[0]

            destFileNames.forEach(async (destFileName: string) => {
                const destFaceEmbeddingsRaw = await fs.readFile(
                    `./tmp/${destFileName}.json`,
                    'utf8'
                )
                const destFaceEmbeddings: FaceEmbedding[] = JSON.parse(
                    destFaceEmbeddingsRaw
                )

                const match = EmbeddingsService.compareFaceEmbeddings(
                    srcFaceEmbedding,
                    destFaceEmbeddings
                )

                // if face matches faces from another embeddings
                if (match) {
                    console.log(
                        `Found match ${srcFileName} with ${destFileName}`
                    )
                }
                // no match found
                else {
                    console.error(
                        `No match found ${srcFileName} with ${destFileName}`
                    )
                }
            })

            // acknowledge message
            channel.ack(msg)
        }
    })
}

export default listenCompareEmbeddings
