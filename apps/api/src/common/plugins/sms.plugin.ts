import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import twilio from 'twilio'

interface SmsService {
  send(to: string, body: string): Promise<void>
}

declare module 'fastify' {
  interface FastifyInstance {
    sms: SmsService
  }
}

const smsPlugin: FastifyPluginAsync = fp(async (app) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!
  const authToken = process.env.TWILIO_AUTH_TOKEN!
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID!

  const client = twilio(accountSid, authToken)

  app.decorate('sms', {
    async send(to: string, body: string) {
      const normalized = to.startsWith('+') ? to : `+55${to.replace(/\D/g, '')}`
      await client.messages.create({ body, messagingServiceSid, to: normalized })
    },
  } satisfies SmsService)
})

export { smsPlugin }
