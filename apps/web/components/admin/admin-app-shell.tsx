'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { type ReactNode, useEffect, useState } from 'react'
import { useClubSettings } from '@/lib/use-club-settings'

type AuthUser = { name: string; email: string; role: string }

function NavIcon({ name }: { name: string }) {
  return (
    <span className="material-symbols-outlined text-[20px]" aria-hidden>
      {name}
    </span>
  )
}

const linkBase = 'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium'
const inactive = `${linkBase} text-on-surface-variant hover:bg-gray-50`
const active = `${linkBase} bg-gray-100 text-on-surface font-semibold`
const subInactive = 'flex items-center gap-2.5 pl-10 pr-4 py-2 rounded-lg transition-all text-sm text-on-surface-variant hover:bg-gray-50'
const subActive = 'flex items-center gap-2.5 pl-10 pr-4 py-2 rounded-lg transition-all text-sm text-on-surface font-semibold bg-gray-100'

type NavGroupProps = {
  label: string
  icon: string
  defaultOpen?: boolean
  children: ReactNode
}

function NavGroup({ label, icon, defaultOpen = false, children }: NavGroupProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${linkBase} w-full text-on-surface-variant hover:bg-gray-50 justify-between`}
      >
        <div className="flex items-center gap-3">
          <NavIcon name={icon} />
          <span>{label}</span>
        </div>
        <span
          className="material-symbols-outlined text-[16px] transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden
        >
          expand_more
        </span>
      </button>
      {open && <div className="mt-0.5 space-y-0.5">{children}</div>}
    </div>
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
  const settings = useClubSettings()

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

  const is = (href: string) => pathname === href || pathname?.startsWith(`${href}/`)

  const agendaGroupActive = is('/agendas') || is('/schedule-configs') || is('/schedule-logs')
  const cadastroGroupActive = is('/users') || is('/access-profiles')

  return (
    <>
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto custom-scrollbar bg-white border-r border-gray-200 flex flex-col py-6 px-4 space-y-1 z-30">
        <div className="mb-8 px-2 flex items-center justify-center">
          {settings.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={settings.clubName}
              width={180}
              height={64}
              className="object-contain max-h-16 w-auto"
              unoptimized
            />
          ) : (
            <span className="text-2xl font-black tracking-tighter text-on-surface px-2">
              {settings.clubName}
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-0.5">
          {/* Painel */}
          <Link
            href="/dashboard"
            className={is('/dashboard') ? active : inactive}
          >
            <NavIcon name="grid_view" />
            <span>Painel</span>
          </Link>

          {/* Sócios */}
          <Link href="/members" className={is('/members') ? active : inactive}>
            <NavIcon name="group" />
            Sócios
          </Link>

          {/* Áreas comuns */}
          <Link href="/areas" className={is('/areas') ? active : inactive}>
            <NavIcon name="holiday_village" />
            Áreas comuns
          </Link>

          {/* Agendamentos */}
          <Link href="/bookings" className={is('/bookings') ? active : inactive}>
            <NavIcon name="event" />
            Agendamentos
          </Link>

          {/* Agenda (grupo) */}
          <NavGroup label="Agenda" icon="calendar_month" defaultOpen={agendaGroupActive}>
            <Link href="/agendas" className={is('/agendas') ? subActive : subInactive}>
              <NavIcon name="calendar_today" />
              Criar agendas
            </Link>
            <Link href="/schedule-configs" className={is('/schedule-configs') ? subActive : subInactive}>
              <NavIcon name="schedule" />
              Rotinas
            </Link>
            <Link href="/schedule-logs" className={is('/schedule-logs') ? subActive : subInactive}>
              <NavIcon name="history" />
              Histórico
            </Link>
          </NavGroup>

          {/* Cadastro (grupo) */}
          <NavGroup label="Cadastro" icon="manage_accounts" defaultOpen={cadastroGroupActive}>
            <Link href="/users" className={is('/users') ? subActive : subInactive}>
              <NavIcon name="person" />
              Usuários
            </Link>
            <Link href="/access-profiles" className={is('/access-profiles') ? subActive : subInactive}>
              <NavIcon name="admin_panel_settings" />
              Perfis de acesso
            </Link>
          </NavGroup>

          {/* Configurações */}
          <Link href="/settings" className={is('/settings') ? active : inactive}>
            <NavIcon name="settings" />
            Configurações
          </Link>

          {/* Notificações */}
          <div className="pt-4 mt-4 border-t border-gray-100">
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
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-20 pb-12 px-8 min-h-screen">{children}</main>
    </>
  )
}
