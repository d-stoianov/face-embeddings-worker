import { cert, initializeApp, ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { FaceEmbedding } from '../EmbeddingsService'

import serviceAccount from '../../secrets/service-account-key.json'

class FirebaseApp {
    private EMBEDDINGS_COLLECTION = 'embeddings'
    private COMPARE_RESULT_COLLECTION = 'compare_result'

    private app
    private db

    constructor() {
        this.app = initializeApp({
            credential: cert(serviceAccount as ServiceAccount),
        })
        this.db = getFirestore(this.app)

        console.log('Initialized firebase')
    }

    async storeEmbeddings(
        eventId: string,
        fileName: string,
        embeddings: FaceEmbedding[]
    ) {
        await this.db
            .collection(this.EMBEDDINGS_COLLECTION)
            .doc(eventId)
            .set(
                {
                    [fileName]: {
                        embeddings: JSON.stringify(embeddings),
                        ready: 'true',
                    },
                },
                { merge: true } // do not overwrite event collection
            )
    }

    async getEmbeddings(
        eventId: string
    ): Promise<Map<string, FaceEmbedding[]>> {
        const docRef = this.db
            .collection(this.EMBEDDINGS_COLLECTION)
            .doc(eventId)
        const docSnap = await docRef.get()

        const result: Map<string, FaceEmbedding[]> = new Map()

        if (!docSnap.exists) {
            throw new Error(`No document - ${eventId}`)
        } else {
            const data = docSnap.data()

            if (!data) return result

            for (const fileName of Object.keys(data)) {
                const fileDoc = data[fileName]
                if (typeof fileDoc === 'object' && fileDoc.embeddings) {
                    // convert embeddings to the right type
                    const parsed = JSON.parse(fileDoc.embeddings) as number[][]
                    const embeddings = parsed.map(
                        (obj) => new Float32Array(Object.values(obj))
                    )

                    result.set(fileName, embeddings)
                }
            }
        }

        return result
    }

    async storeCompareResult(
        eventId: string,
        compareKey: string,
        matches: string[]
    ) {
        await this.db
            .collection(this.COMPARE_RESULT_COLLECTION)
            .doc(eventId)
            .set(
                {
                    [compareKey]: {
                        matches,
                        ready: true
                    },
                },
                { merge: true } // do not overwrite event collection)
            )
    }
}

const firebaseApp = new FirebaseApp()

export default firebaseApp
