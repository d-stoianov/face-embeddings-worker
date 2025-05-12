import * as dotenv from 'dotenv'
import { ServiceAccount } from 'firebase-admin'
import path from 'path'

dotenv.config()

export const AMQP_URL = process.env.AMQP_URL || ''
export const MODELS_PATH = path.resolve(
    process.env.MODELS_PATH || '../../models'
)
export const FIREBASE_SERVICE_ACCOUNT = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64!, 'base64').toString(
        'utf-8'
    )
) as ServiceAccount
