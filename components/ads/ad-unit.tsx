'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''

type AdPlacement = 'home' | 'reader'

const slotByPlacement: Record<AdPlacement, string> = {
  home: process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT || '',
  reader: process.env.NEXT_PUBLIC_ADSENSE_READER_SLOT || ''
}

interface AdUnitProps {
  placement: AdPlacement
  className?: string
}

export function AdUnit({ placement, className }: AdUnitProps) {
  const slot = slotByPlacement[placement]
  const configured = Boolean(adClient && slot)

  useEffect(() => {
    if (!configured) return

    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch {
      // Ad blockers or unapproved AdSense domains can reject the push.
    }
  }, [configured, placement, slot])

  if (!configured) {
    return (
      <aside
        aria-label="Espacio patrocinado"
        className={cn(
          'mx-auto w-full rounded-lg border border-dashed bg-muted/25 px-4 py-5 text-center',
          className
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Espacio patrocinado</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Anuncios respetuosos, sin interrupciones ni contenido invasivo.
        </p>
      </aside>
    )
  }

  return (
    <aside aria-label="Espacio patrocinado" className={cn('mx-auto w-full', className)}>
      <ins
        className="adsbygoogle block"
        data-ad-client={adClient}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  )
}
