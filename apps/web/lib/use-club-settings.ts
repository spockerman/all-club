'use client'

import { useEffect, useState } from 'react'

type ClubSettings = { clubName: string; logoUrl: string }

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const cache: { value: ClubSettings | null } = { value: null }

export function useClubSettings(): ClubSettings {
  const [settings, setSettings] = useState<ClubSettings>(
    cache.value ?? { clubName: 'Centro Avareense', logoUrl: '' },
  )

  useEffect(() => {
    if (cache.value) return
    fetch(`${API_URL}/settings`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          const s: ClubSettings = {
            clubName: data.clubName ?? 'Centro Avareense',
            logoUrl: data.logoUrl ?? '',
          }
          cache.value = s
          setSettings(s)
        }
      })
      .catch(() => {})
  }, [])

  return settings
}
