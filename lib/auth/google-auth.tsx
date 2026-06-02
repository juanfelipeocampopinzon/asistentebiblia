'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const TOKEN_KEY = 'biblia_google_id_token'

interface GoogleProfile {
  sub: string
  email: string
  name: string
  picture?: string
}

interface AuthContextValue {
  user: GoogleProfile | null
  token: string | null
  isConfigured: boolean
  login: () => void
  logout: () => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void
          prompt: () => void
        }
      }
    }
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeJwt(token: string): GoogleProfile | null {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map(char => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    const data = JSON.parse(json)

    if (data.exp && Date.now() / 1000 > data.exp) return null

    return {
      sub: data.sub,
      email: data.email,
      name: data.name || data.email,
      picture: data.picture
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<GoogleProfile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY)
    const storedUser = storedToken ? decodeJwt(storedToken) : null
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
  }, [])

  useEffect(() => {
    if (!clientId) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (!response.credential) return
          const profile = decodeJwt(response.credential)
          if (!profile) return
          window.localStorage.setItem(TOKEN_KEY, response.credential)
          setToken(response.credential)
          setUser(profile)
        }
      })
      setReady(true)
    }
    document.body.appendChild(script)

    return () => {
      script.remove()
    }
  }, [clientId])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isConfigured: Boolean(clientId) && ready,
    login: () => {
      window.google?.accounts.id.prompt()
    },
    logout: () => {
      window.localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    }
  }), [clientId, ready, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return value
}

export function getGoogleIdToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}
