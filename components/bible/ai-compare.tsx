'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { GitCompare, Sparkles, Loader2, Tags } from 'lucide-react'
import { Verse } from '@/lib/bible/types'
import { translations } from '@/lib/bible/data/translations'
import { askBibleAI, BibleAIResult } from '@/lib/bible/ai'
import { compareVerseTranslations, VerseComparison } from '@/lib/bible/api'
import { useAuth } from '@/lib/auth/google-auth'
import { GoogleSession } from '@/components/auth/google-session'

interface AICompareProps {
  verse: Verse
  book: string
  bookName: string
  chapter: number
  translation: string
}

export function AICompare({ verse, book, bookName, chapter, translation }: AICompareProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('translations')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<BibleAIResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [comparisons, setComparisons] = useState<VerseComparison[]>([])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysis(null)
    setError(null)

    const prompt = activeTab === 'translations'
      ? `Compara ${bookName} ${chapter}:${verse.number} en distintas traducciones bíblicas.

Textos disponibles:
${comparisons.map(item => `${item.abbreviation}: "${item.text}"`).join('\n') || `${translation.toUpperCase()}: "${verse.text}"`}

Explica matices entre Reina-Valera y KJV. Menciona diferencias de traducción formal/dinámica y el idioma original cuando sea relevante.`
      : `Compara ${bookName} ${chapter}:${verse.number} con pasajes paralelos o relacionados.

Texto base (${translation.toUpperCase()}): "${verse.text}"

Sugiere versículos relacionados y explica similitudes, diferencias y énfasis teológico.`

    try {
      setAnalysis(await askBibleAI(prompt))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo obtener el análisis.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={async (value) => {
        setOpen(value)
        if (!value) {
          setAnalysis(null)
          setError(null)
          return
        }

        try {
          setComparisons(await compareVerseTranslations(book, chapter, verse.number, ['rvr', 'kjv']))
        } catch {
          setComparisons([])
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="Comparar con IA">
          <GitCompare className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            Comparar con IA
            <span className="text-sm font-normal text-muted-foreground">
              {bookName} {chapter}:{verse.number}
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Compare the selected Bible verse with AI.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setAnalysis(null); setError(null) }} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="translations">Traducciones</TabsTrigger>
            <TabsTrigger value="verses">Versículos</TabsTrigger>
          </TabsList>

          <TabsContent value="translations" className="flex-1 flex flex-col gap-4 mt-4">
            <div className="grid gap-3">
              {translations.map((item) => {
                const comparison = comparisons.find(result => result.translation === item.id)

                return (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">
                      {item.abbreviation}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                    {item.available === false && (
                      <span className="text-[10px] text-muted-foreground">pendiente</span>
                    )}
                  </div>
                  <p className="text-sm">
                    {comparison?.text || (item.available === false
                      ? 'No cargada por licencia/fuente autorizada pendiente.'
                      : 'Cargando texto de comparación...')}
                  </p>
                </div>
              )})}
            </div>

            {user ? (
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isAnalyzing ? 'Analizando...' : 'Analizar diferencias con IA'}
              </Button>
            ) : (
              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Inicia sesión con Google para usar el análisis de IA.
                </p>
                <GoogleSession />
              </div>
            )}
          </TabsContent>

          <TabsContent value="verses" className="flex-1 flex flex-col gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Versículo actual:</label>
              <div className="border rounded-lg p-3 bg-muted/50">
                <span className="text-xs font-semibold">{bookName} {chapter}:{verse.number}</span>
                <p className="text-sm mt-1">{verse.text}</p>
              </div>
            </div>

            {user ? (
              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="gap-2">
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isAnalyzing ? 'Analizando...' : 'Comparar versículos con IA'}
              </Button>
            ) : (
              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Inicia sesión con Google para usar el análisis de IA.
                </p>
                <GoogleSession />
              </div>
            )}
          </TabsContent>

          {error && (
            <div className="border rounded-lg p-4 mt-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {analysis && (
            <ScrollArea className="border rounded-lg p-4 bg-primary/5 max-h-56 mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">Análisis IA</span>
                </div>
                <div className="text-sm whitespace-pre-wrap">{analysis.response}</div>
                {(analysis.topic_tags.length > 0 || analysis.related_verses.length > 0) && (
                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <div className="flex items-center gap-1 font-medium">
                      <Tags className="h-3.5 w-3.5" />
                      Referencias
                    </div>
                    {analysis.topic_tags.length > 0 && <p>Temas: {analysis.topic_tags.join(', ')}</p>}
                    {analysis.related_verses.length > 0 && <p>Relacionados: {analysis.related_verses.join(', ')}</p>}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
