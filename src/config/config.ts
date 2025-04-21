import * as dotenv from 'dotenv'

dotenv.config()

export const AMQP_URL = process.env.AMQP_URL || ''
export const FIREBASE_CONFIG_STR = process.env.FIREBASE_CONFIG_STR || ''