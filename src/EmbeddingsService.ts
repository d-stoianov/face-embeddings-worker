import * as canvas from 'canvas'
import * as faceapi from 'face-api.js'

class EmbeddingsService {
    static async createFaceEmbeddings(
        fileBuffer: Buffer
    ): Promise<Float32Array<ArrayBufferLike>[]> {
        const image = await canvas.loadImage(fileBuffer)
        const detections = await faceapi
            .detectAllFaces(image as unknown as faceapi.TNetInput)
            .withFaceLandmarks()
            .withFaceDescriptors()

        return detections.map((d) => d.descriptor)
    }
}

export default EmbeddingsService
