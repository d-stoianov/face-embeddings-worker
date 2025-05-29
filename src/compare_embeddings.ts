import firebaseApp from './config/firebase'
import mqConnection from './connection'
import EmbeddingsService from './EmbeddingsService'

const receiveQueue = 'compare_embeddings'

async function listenCompareEmbeddings() {
    await mqConnection.receive(receiveQueue, async (msg, channel) => {
        if (msg) {
            console.log(`New message in the queue - ${receiveQueue}`)

            const response = JSON.parse(msg.content.toString())
            const { eventId, compareKey, fileName } = response

            const fileBuffer = await firebaseApp.getFile(`${eventId}/${compareKey}`, fileName)

            console.log(`Creating face embeddings for ${fileName}...`)

            const selfieEmbeddings =
                await EmbeddingsService.createFaceEmbeddings(fileBuffer)

            console.log('Face embeddings created')

            if (selfieEmbeddings.length === 0) {
                console.log('No faces found on the selfie')
                channel.ack(msg)
                return
            }

            if (selfieEmbeddings.length > 1) {
                console.log('Selfie should contain only one face')
                channel.ack(msg)
                return
            }

            const faceEmbeddings = selfieEmbeddings[0]

            const fileNameEmbeddingsMap = await firebaseApp.getEmbeddings(
                eventId
            )

            console.log(
                `Got ${fileNameEmbeddingsMap.size} embeddings by event id`
            )

            const matches: string[] = []

            for (const [fileName, embeddings] of fileNameEmbeddingsMap) {
                if (!embeddings) {
                    continue
                }

                const match = EmbeddingsService.compareFaceEmbeddings(
                    faceEmbeddings,
                    embeddings
                )

                // if face matches faces from another embeddings
                if (match) {
                    console.log(`Found match with ${fileName}`)
                    matches.push(fileName)
                }
                // no match found
                else {
                    console.error(`No match found with ${fileName}`)
                }
            }

            console.log(
                `Saving compare result - ${compareKey} to the firestore..`
            )

            await firebaseApp.storeCompareResult(eventId, compareKey, matches)

            console.log(
                `Done saving compare result - ${compareKey} to the firestore`
            )
            // acknowledge message
            channel.ack(msg)
        }
    })
}

export default listenCompareEmbeddings
