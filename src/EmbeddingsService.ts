import * as canvas from 'canvas'
import * as faceapi from 'face-api.js'

export type FaceEmbedding = Float32Array

class EmbeddingsService {
    static async createFaceEmbeddings(
        fileBuffer: Buffer
    ): Promise<FaceEmbedding[]> {
        const image = await canvas.loadImage(fileBuffer)
        const detections = await faceapi
            .detectAllFaces(image as unknown as faceapi.TNetInput)
            .withFaceLandmarks()
            .withFaceDescriptors()

        return detections
            .map((d) => d.descriptor)
            .filter((descriptor) => descriptor !== undefined)
    }

    static compareFaceEmbeddings = (
        srcEmbedding: FaceEmbedding,
        destEmbeddings: FaceEmbedding[]
    ): boolean => {
        const threshold = 0.55 // distance threshold for matching

        return destEmbeddings.some((destEmbedding) => {
            const distance = faceapi.euclideanDistance(
                srcEmbedding,
                destEmbedding
            )
            return distance < threshold
        })
    }
}

export default EmbeddingsService
