import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-surface">
      <h1 className="text-6xl font-black text-gray-300 mb-4">404</h1>
      <p className="text-on-surface-variant mb-6">Página não encontrada.</p>
      <Link href="/dashboard" className="text-sm font-semibold text-gray-600 hover:underline">
        Voltar ao painel
      </Link>
    </div>
  )
}
