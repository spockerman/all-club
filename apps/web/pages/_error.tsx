import type { NextPageContext } from 'next'

type Props = {
  statusCode?: number
}

export default function Error({ statusCode }: Props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', margin: 0 }}>{statusCode}</h1>
        <p style={{ color: '#666' }}>
          {statusCode === 404 ? 'Página não encontrada' : 'Erro interno do servidor'}
        </p>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? (err as any)?.statusCode ?? 404
  return { statusCode }
}
