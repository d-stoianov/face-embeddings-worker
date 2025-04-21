import loadModels from './config/faceapi'
import './config/firebase' // create firebase app instance

import listenCompareEmbeddings from './compare_embeddings'
import mqConnection from './connection'
import listenCreateEmbeddings from './create_embeddings'

async function main() {
    await loadModels()
    await mqConnection.connect()

    await listenCreateEmbeddings()
    await listenCompareEmbeddings()
}

main()
