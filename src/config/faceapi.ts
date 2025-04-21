import { Canvas, Image, ImageData } from 'canvas'
import * as faceapi from 'face-api.js'
import path from 'path'

const MODELS_PATH = path.join(__dirname, '../../models')

async function loadModels() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH)
    await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH)
    await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH)
    // @ts-ignore
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
}

export default loadModels
