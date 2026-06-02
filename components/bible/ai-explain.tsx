'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Lightbulb, Sparkles, Loader2, Tags, BookOpen } from 'lucide-react'
import { Verse } from '@/lib/bible/types'
import { askBibleAI, BibleAIResult } from '@/lib/bible/ai'
import { useAuth } from '@/lib/auth/google-auth'
import { GoogleSession } from '@/components/auth/google-session'

interface AIExplainProps {
  verse: Verse
  book: string
  bookName: string
  chapter: number
  translation: string
}

export function AIExplain({ verse, book, bookName, chapter, translation }: AIExplainProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [explanation, setExplanation] = useState<BibleAIResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExplain = async () => {
    setIsLoading(true)
    setExplanation(null)
    setError(null)

    try {
      const result = await askBibleAI(
        `Analiza el versículo ${bookName} ${chapter}:${verse.number} (${translation.toUpperCase()}).

Texto: "${verse.text}"

Incluye contexto histórico, contexto literario, significado teológico y aplicación general.`
      )
      setExplanation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo obtener la explicación.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (!value) { setExplanation(null); setError(null) } }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Explicar versículo">
          <Lightbulb className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Explicación del versículo
          </DialogTitle>
          <DialogDescription className="sr-only">
            AI explanation for the selected Bible verse.
          </DialogDescription>
        </DialogHeader>

        <div className="border rounded-lg p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold">{bookName} {chapter}:{verse.number}</span>
            <span className="text-xs text-muted-foreground">({translation.toUpperCase()})</span>
          </div>
          <p className="text-sm italic">&ldquo;{verse.text}&rdquo;</p>
        </div>

        {!user && !explanation && !isLoading && (
          <div className="border rounded-lg p-4 mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Inicia sesión con Google para usar las funciones de IA.
            </p>
            <GoogleSession />
          </div>
        )}

        {user && !explanation && !isLoading && !error && (
          <Button onClick={handleExplain} className="gap-2 mt-4">
            <Sparkles className="h-4 w-4" />
            Obtener explicación con IA
          </Button>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analizando el versículo...</p>
          </div>
        )}

        {error && (
          <div className="border rounded-lg p-4 mt-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {explanation && (
          <ScrollArea className="flex-1 mt-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Análisis</h3>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{explanation.response}</p>
              </div>

              {(explanation.topic_tags.length > 0 || explanation.related_verses.length > 0) && (
                <div className="border rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Tags className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Referencias</h3>
                  </div>
                  {explanation.topic_tags.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Temas: {explanation.topic_tags.join(', ')}
                    </p>
                  )}
                  {explanation.related_verses.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Versículos relacionados: {explanation.related_verses.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
