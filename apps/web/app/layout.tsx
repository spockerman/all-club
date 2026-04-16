import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'All Club — Painel Administrativo',
  description: 'Sistema de gestão de clube social',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`light ${inter.variable}`}>
      <body className={`${inter.className} bg-background text-on-surface antialiased font-sans`}>
        {children}
      </body>
    </html>
  )
}
