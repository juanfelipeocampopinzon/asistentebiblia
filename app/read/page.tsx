'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getReadingProgress } from '@/lib/bible/storage'

export default function ReadRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Check for saved reading progress
    const progress = getReadingProgress()
    
    if (progress) {
      // Resume where the user left off
      router.replace(`/read/${progress.translation}/${progress.book}/${progress.chapter}`)
    } else {
      router.replace('/read/rvr/genesis/1')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-8 w-8 mx-auto rounded-full bg-primary/20" />
        </div>
        <p className="mt-4 text-muted-foreground">Cargando tu Biblia...</p>
      </div>
    </div>
  )
}
