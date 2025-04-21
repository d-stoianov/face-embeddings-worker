import { cert, initializeApp, ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

import serviceAccount from '../../secrets/service-account-key.json'

export class FirebaseApp {
    private app
    private db

    constructor() {
        this.app = initializeApp({
            credential: cert(serviceAccount as ServiceAccount),
        })
        this.db = getFirestore(this.app)

        console.log('Initialized firebase')
    }
}

const firebaseApp = new FirebaseApp()

export default firebaseApp
