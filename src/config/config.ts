import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config()

export const AMQP_URL = process.env.AMQP_URL || ''
export const MODELS_PATH = path.resolve(process.env.MODELS_PATH || '../../models')
export const FIREBASE_CONFIG_STR = process.env.FIREBASE_CONFIG_STR || ''
