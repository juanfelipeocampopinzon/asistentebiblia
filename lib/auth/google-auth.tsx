'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const TOKEN_KEY = 'biblia_google_id_token'
const DEV_TOKEN = 'local-dev-token'
const DEV_USER: GoogleProfile = {
  sub: 'local-dev-user',
  email: 'local-dev@example.com',
  name: 'Local Dev'
}

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
  renderButton: (container: HTMLElement) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void
          prompt: () => void
          renderButton: (container: HTMLElement, config: unknown) => void
          disableAutoSelect: () => void
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
  const authBypass = process.env.NEXT_PUBLIC_AI_AUTH_BYPASS === 'true'
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<GoogleProfile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (authBypass) {
      window.localStorage.setItem(TOKEN_KEY, DEV_TOKEN)
      setToken(DEV_TOKEN)
      setUser(DEV_USER)
      setReady(true)
      return
    }

    const storedToken = window.localStorage.getItem(TOKEN_KEY)
    const storedUser = storedToken ? decodeJwt(storedToken) : null
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
    }
  }, [authBypass])

  useEffect(() => {
    if (authBypass) return
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
  }, [authBypass, clientId])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isConfigured: authBypass || (Boolean(clientId) && ready),
    login: () => {
      if (authBypass) {
        window.localStorage.setItem(TOKEN_KEY, DEV_TOKEN)
        setToken(DEV_TOKEN)
        setUser(DEV_USER)
        return
      }
      window.google?.accounts.id.prompt()
    },
    logout: () => {
      if (authBypass) {
        window.localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
        return
      }
      window.google?.accounts.id.disableAutoSelect()
      window.localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
    },
    renderButton: (container: HTMLElement) => {
      if (authBypass) return
      if (!ready) return
      container.innerHTML = ''
      window.google?.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'medium',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        locale: 'es'
      })
    }
  }), [authBypass, clientId, ready, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return value
}

export function getGoogleIdToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY) || (
    process.env.NEXT_PUBLIC_AI_AUTH_BYPASS === 'true' ? DEV_TOKEN : null
  )
}
