import { cert, initializeApp, ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { FaceEmbedding } from '../EmbeddingsService'

import serviceAccount from '../../secrets/service-account-key.json'

class FirebaseApp {
    private EMBEDDINGS_COLLECTION = 'embeddings'

    private app
    private db

    constructor() {
        this.app = initializeApp({
            credential: cert(serviceAccount as ServiceAccount),
        })
        this.db = getFirestore(this.app)

        console.log('Initialized firebase')
    }

    async storeEmbeddings(fileName: string, embeddings: FaceEmbedding[]) {
        await this.db
            .collection(this.EMBEDDINGS_COLLECTION)
            .doc(fileName)
            .set({ ready: 'true', embeddings: JSON.stringify(embeddings) })
    }
}

const firebaseApp = new FirebaseApp()

export default firebaseApp
