import * as dotenv from 'dotenv'

dotenv.config()

export const AMQP_URL = process.env.AMQP_URL || ''
