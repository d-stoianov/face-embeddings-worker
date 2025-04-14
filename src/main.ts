import mqConnection from './connection'
import listenCreateEmbeddings from './create_embeddings'

async function main() {
    await mqConnection.connect()
    await listenCreateEmbeddings()
}

main()
