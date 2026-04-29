'use client'

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f1f1ee' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', color: '#1a1c1e', marginBottom: '0.5rem' }}>
            Algo deu errado
          </h1>
          <p style={{ color: '#596064', marginBottom: '1.5rem' }}>
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#4b5563',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
