import fp from 'fastify-plugin'
import nodemailer from 'nodemailer'
import type { FastifyPluginAsync } from 'fastify'
import type { Transporter } from 'nodemailer'

declare module 'fastify' {
  interface FastifyInstance {
    mailer: Transporter
  }
}

const mailerPlugin: FastifyPluginAsync = fp(async (app) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST ?? 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.MAILTRAP_PORT ?? 2525),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  })

  app.decorate('mailer', transporter)
})

export { mailerPlugin }

// ── Email templates ──────────────────────────────────────────────────────────

export function buildActivationEmail(params: {
  name: string
  token: string
  scheme: string
}) {
  const { name, token, scheme } = params
  const deepLink = `${scheme}://set-password?token=${token}`

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <h2 style="color:#1F2937;margin-bottom:8px">Bem-vindo ao All Club</h2>
      <p style="color:#4B5563;margin-bottom:24px">Olá, <strong>${name}</strong>!</p>
      <p style="color:#4B5563">Seu cadastro foi realizado. Clique no botão abaixo para criar sua senha e acessar o aplicativo.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${deepLink}"
           style="background:#374151;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;letter-spacing:1px;display:inline-block">
          CRIAR MINHA SENHA
        </a>
      </div>
      <p style="color:#9CA3AF;font-size:13px">Este link expira em 24 horas. Se você não solicitou o cadastro, ignore este e-mail.</p>
    </div>
  `

  const text = `Bem-vindo ao All Club, ${name}!\n\nCrie sua senha acessando o link abaixo no seu celular:\n${deepLink}\n\nEste link expira em 24 horas.`

  return { html, text }
}
