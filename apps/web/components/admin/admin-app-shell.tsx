'use client'

import { eficienciaEquipe } from '@/lib/dashboard-fake-data'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'

type AuthUser = { name: string; email: string; role: string }

const areasBookingsNav = [
  { href: '/areas', label: 'Áreas comuns', icon: 'holiday_village' },
  { href: '/bookings', label: 'Agendamentos', icon: 'event' },
  { href: '/agendas', label: 'Agendas', icon: 'calendar_month' },
  { href: '/schedule-configs', label: 'Rotinas', icon: 'schedule' },
  { href: '/schedule-logs', label: 'Histórico', icon: 'history' },
] as const

function NavIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined text-[20px]" aria-hidden>
      {name}
    </span>
  )
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function getToken(): string | undefined {
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

export function AdminAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return
    fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setUser({ name: data.name, email: data.email, role: data.role }) })
      .catch(() => {})
  }, [])

  function handleLogout() {
    const refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refresh_token') : null
    const token = getToken()
    if (token) {
      fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {})
    }
    document.cookie = 'access_token=; path=/; max-age=0'
    localStorage.removeItem('refresh_token')
    router.push('/login')
  }

  const linkBase =
    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium'
  const inactive = `${linkBase} text-on-surface-variant hover:bg-gray-50`
  const active = `${linkBase} bg-gray-100 text-on-surface font-semibold`

  const painelActive = pathname === '/dashboard'
  const sociosActive = pathname === '/members' || pathname?.startsWith('/members/')

  return (
    <>
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto custom-scrollbar bg-white border-r border-gray-200 flex flex-col py-6 px-4 space-y-1 z-30">
        <div className="text-2xl font-black tracking-tighter text-on-surface mb-8 px-4">All Club</div>
        <nav className="flex-1 space-y-1">
          <Link
            href="/dashboard"
            className={
              painelActive
                ? 'flex items-center justify-between px-4 py-2.5 bg-gray-100 text-on-surface rounded-lg transition-all'
                : 'flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-gray-50 rounded-lg transition-all'
            }
          >
            <div className="flex items-center gap-3">
              <NavIcon name="grid_view" />
              <span className="text-sm font-semibold">Painel</span>
            </div>
          </Link>

          <Link
            href="/members"
            className={
              sociosActive
                ? `${linkBase} bg-gray-100 text-on-surface font-semibold`
                : inactive
            }
          >
            <NavIcon name="group" />
            Sócios
          </Link>

          {areasBookingsNav.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href} className={isActive ? active : inactive}>
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            )
          })}

          <Link
            href="/users"
            className={pathname === '/users' || pathname?.startsWith('/users/') ? active : inactive}
          >
            <NavIcon name="manage_accounts" />
            Usuários
          </Link>
          <Link
            href="/access-profiles"
            className={pathname === '/access-profiles' || pathname?.startsWith('/access-profiles/') ? active : inactive}
          >
            <NavIcon name="admin_panel_settings" />
            Perfis de acesso
          </Link>

          <Link href="#" className={inactive}>
            <NavIcon name="handshake" />
            Convênios
          </Link>
          <Link href="#" className={inactive}>
            <NavIcon name="analytics" />
            Relatórios
          </Link>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link href="#" className={inactive}>
              <NavIcon name="person" />
              Equipe
            </Link>
            <Link href="#" className={inactive}>
              <NavIcon name="mail" />
              Mensagens
            </Link>
            <Link
              href="#"
              className="flex items-center justify-between px-4 py-2.5 text-on-surface-variant hover:bg-gray-50 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <NavIcon name="notifications" />
                <span className="text-sm font-medium">Notificações</span>
              </div>
              <span className="bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">5</span>
            </Link>
          </div>
        </nav>

        <div className="pt-6 space-y-1 border-t border-gray-100">
          {user && (
            <div className="px-4 py-2 mb-1">
              <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <NavIcon name="logout" />
            Sair
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-64 h-16 z-20 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 border-b border-gray-100">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center w-full max-w-md">
            <span className="material-symbols-outlined text-gray-400 mr-2" aria-hidden>
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-gray-400 outline-none"
              placeholder="Buscar..."
              type="search"
              name="q"
              aria-label="Buscar"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-on-surface"
            title="Conta"
          >
            AC
          </div>
        </div>
      </header>

      {/* Painel direito — sem toggles de moeda */}
      <aside className="fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] bg-white border-l border-gray-200 z-10 p-6 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-on-surface">Equipe &amp; atendimento</h2>
        </div>
        <div className="space-y-8 flex-1">
          {eficienciaEquipe.map((row) => (
            <div key={row.nome}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-on-surface shrink-0">
                    {row.iniciais}
                  </div>
                  <span className="text-xs font-bold text-on-surface truncate">{row.nome}</span>
                </div>
                <span className="text-xs font-bold text-on-surface shrink-0">{row.pct}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className={`${row.bar} h-full`} style={{ width: row.width }} />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mr-80 pt-20 pb-12 px-8 min-h-screen">{children}</main>
    </>
  )
}
