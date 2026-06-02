'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/google-auth'
import { LogIn, LogOut } from 'lucide-react'
import { useEffect, useRef } from 'react'

export function GoogleSession() {
  const { user, isConfigured, login, logout, renderButton } = useAuth()
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user && isConfigured && googleButtonRef.current) {
      renderButton(googleButtonRef.current)
    }
  }, [isConfigured, renderButton, user])

  if (!isConfigured) {
    return (
      <Button variant="outline" size="sm" disabled title="Configura NEXT_PUBLIC_GOOGLE_CLIENT_ID">
        Google
      </Button>
    )
  }

  if (!user) {
    return (
      <div className="min-h-8 min-w-[92px]">
        <div ref={googleButtonRef} />
        <Button variant="outline" size="sm" onClick={login} className="hidden gap-2">
          <LogIn className="h-4 w-4" />
          Entrar
        </Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
      {user.picture && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.picture} alt="" className="h-5 w-5 rounded-full" />
      )}
      <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
      <LogOut className="h-4 w-4" />
    </Button>
  )
}
