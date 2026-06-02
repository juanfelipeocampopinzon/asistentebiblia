'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ChapterNavProps {
  bookName: string
  chapter: number
  totalChapters: number
  onPrevious: () => void
  onNext: () => void
  hasPrevious: boolean
  hasNext: boolean
}

export function ChapterNav({
  bookName,
  chapter,
  totalChapters,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext
}: ChapterNavProps) {
  return (
    <div className="flex items-center justify-between py-4 border-t mt-8">
      <Button
        variant="ghost"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      <div className="text-sm text-muted-foreground">
        Capítulo {chapter} de {totalChapters}
      </div>

      <Button
        variant="ghost"
        onClick={onNext}
        disabled={!hasNext}
        className="gap-2"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
