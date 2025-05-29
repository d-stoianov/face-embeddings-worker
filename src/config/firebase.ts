import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { FaceEmbedding } from '../EmbeddingsService'
import { FIREBASE_SERVICE_ACCOUNT, FIREBASE_STORAGE_BUCKET } from './config'

class FirebaseApp {
    private EMBEDDINGS_COLLECTION = 'embeddings'
    private COMPARE_RESULT_COLLECTION = 'compare_result'

    private app
    private bucket
    private db

    constructor() {
        this.app = initializeApp({
            credential: cert(FIREBASE_SERVICE_ACCOUNT),
            storageBucket: FIREBASE_STORAGE_BUCKET,
        })
        this.bucket = getStorage(this.app).bucket()
        this.db = getFirestore(this.app)

        console.log('Initialized firebase')
    }

    async storeEmbeddings(
        eventId: string,
        fileName: string,
        embeddings: FaceEmbedding[]
    ) {
        console.log(
            `Storing embeddings by eventId - ${eventId} for the file - ${fileName} ...`
        )
        await this.db
            .collection(this.EMBEDDINGS_COLLECTION)
            .doc(eventId)
            .set(
                {
                    [fileName]: {
                        embeddings: JSON.stringify(embeddings),
                        status: 'true',
                    },
                },
                { merge: true } // do not overwrite event collection
            )
        console.log(
            `Done storing embeddings by eventId - ${eventId} for the file - ${fileName}`
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
                        status: true,
                    },
                },
                { merge: true } // do not overwrite event collection)
            )
    }

    async getFile(folderName: string, fileName: string): Promise<Buffer> {
        try {
            const [files] = await this.bucket.getFiles()

            const file = files.find(
                (f) => f.name === `${folderName}/${fileName}`
            )
            if (!file) {
                throw new Error(`File ${folderName}/${fileName} not found`)
            }

            const [contents] = await file.download()

            return contents
        } catch (error) {
            console.error('Error while getting image from the bucket:', error)
            throw error
        }
    }
}

const firebaseApp = new FirebaseApp()

export default firebaseApp
