import loadModels from './config/faceapi_config'

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
