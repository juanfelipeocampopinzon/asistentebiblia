'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GitCompare, Sparkles, Loader2, Tags, Plus, X } from 'lucide-react'
import { Verse } from '@/lib/bible/types'
import { translations } from '@/lib/bible/data/translations'
import { askBibleAI, BibleAIResult } from '@/lib/bible/ai'
import { compareVerseTranslations, getVerseByReference, ResolvedVerseReference, VerseComparison } from '@/lib/bible/api'
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
  const [depth, setDepth] = useState<'brief' | 'deep'>('brief')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<BibleAIResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [comparisons, setComparisons] = useState<VerseComparison[]>([])
  const [referenceInput, setReferenceInput] = useState('')
  const [referenceError, setReferenceError] = useState<string | null>(null)
  const [isAddingReference, setIsAddingReference] = useState(false)
  const [customVerses, setCustomVerses] = useState<ResolvedVerseReference[]>([])

  const currentVerseReference = `${bookName} ${chapter}:${verse.number}`
  const currentVerseContext: ResolvedVerseReference = {
    book,
    bookName,
    chapter,
    verse: verse.number,
    text: verse.text,
    translation,
    reference: currentVerseReference
  }

  const verseKey = (item: Pick<ResolvedVerseReference, 'book' | 'chapter' | 'verse' | 'translation'>) =>
    `${item.translation}:${item.book}:${item.chapter}:${item.verse}`

  const addVerseToContext = (item: ResolvedVerseReference) => {
    setCustomVerses(prev => {
      if (prev.some(existing => verseKey(existing) === verseKey(item))) return prev
      return [...prev, item].slice(0, 10)
    })
    setAnalysis(null)
    setError(null)
  }

  const handleAddCurrentVerse = () => {
    addVerseToContext(currentVerseContext)
  }

  const handleAddReference = async () => {
    if (!referenceInput.trim()) return

    setIsAddingReference(true)
    setReferenceError(null)
    try {
      const references = referenceInput
        .split(/[,;]+/)
        .map(item => item.trim())
        .filter(Boolean)

      const resolvedVerses: ResolvedVerseReference[] = []
      const failedReferences: string[] = []

      for (const reference of references) {
        const resolved = await getVerseByReference(reference, translation)
        if (resolved) {
          resolvedVerses.push(resolved)
        } else {
          failedReferences.push(reference)
        }
      }

      resolvedVerses.forEach(addVerseToContext)
      if (failedReferences.length > 0) {
        setReferenceError(`No encontre: ${failedReferences.join(', ')}.`)
      }
      if (resolvedVerses.length > 0) setReferenceInput('')
    } catch {
      setReferenceError('No pude cargar esos versiculos desde el backend.')
    } finally {
      setIsAddingReference(false)
    }
  }

  const removeVerseFromContext = (item: ResolvedVerseReference) => {
    setCustomVerses(prev => prev.filter(existing => verseKey(existing) !== verseKey(item)))
    setAnalysis(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysis(null)
    setError(null)

    const depthInstruction = depth === 'deep'
      ? 'Responde con un análisis profundo de 300 a 450 palabras, usando secciones cortas y claras.'
      : 'Responde con un análisis breve de 90 a 130 palabras, claro y directo.'

    const versesForPrompt = customVerses.length > 0 ? customVerses : [currentVerseContext]
    const prompt = activeTab === 'translations'
      ? `Compara ${bookName} ${chapter}:${verse.number} en distintas traducciones bíblicas.

Textos disponibles:
${comparisons.map(item => `${item.abbreviation}: "${item.text}"`).join('\n') || `${translation.toUpperCase()}: "${verse.text}"`}

Explica matices entre Reina-Valera y KJV. Menciona diferencias de traducción formal/dinámica y el idioma original cuando sea relevante.
${depthInstruction}`
      : `Analiza y compara estos versiculos seleccionados por el usuario.

Traduccion base: ${translation.toUpperCase()}
Versiculos:
${versesForPrompt.map(item => `- ${item.reference} (${item.translation.toUpperCase()}): "${item.text}"`).join('\n')}

Explica conexiones, similitudes, diferencias, contexto y enfasis teologico. Si hay versiculos de distintos libros, muestra como se relacionan sin forzar una conexion que no exista.
${depthInstruction}`

    try {
      setAnalysis(await askBibleAI(prompt, { task: 'compare', depth }))
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
          setReferenceError(null)
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
      <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-2xl overflow-y-auto">
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

        <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); setAnalysis(null); setError(null) }} className="flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="translations">Traducciones</TabsTrigger>
            <TabsTrigger value="verses">Versículos</TabsTrigger>
          </TabsList>

          <TabsContent value="translations" className="mt-4 flex flex-col gap-4">
            <div className="max-h-64 overflow-y-auto rounded-lg border p-3">
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
            </div>

            {user ? (
              <div className="shrink-0 space-y-3">
                <div className="grid grid-cols-2 rounded-md border bg-muted/40 p-1">
                  <Button
                    type="button"
                    variant={depth === 'brief' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setDepth('brief')}
                  >
                    Breve
                  </Button>
                  <Button
                    type="button"
                    variant={depth === 'deep' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setDepth('deep')}
                  >
                    Profundo
                  </Button>
                </div>
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full gap-2">
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isAnalyzing ? 'Analizando...' : depth === 'deep' ? 'Analizar diferencias profundo' : 'Analizar diferencias breve'}
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  Inicia sesión con Google para usar el análisis de IA.
                </p>
                <GoogleSession />
              </div>
            )}
          </TabsContent>

          <TabsContent value="verses" className="mt-4 flex flex-col gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium">Versiculos para analizar</label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddCurrentVerse} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Actual
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={referenceInput}
                  onChange={(event) => {
                    setReferenceInput(event.target.value)
                    setReferenceError(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleAddReference()
                    }
                  }}
                  placeholder="Juan 1:1"
                  disabled={isAddingReference}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={handleAddReference}
                  disabled={isAddingReference || !referenceInput.trim()}
                >
                  {isAddingReference ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
              {referenceError && <p className="text-xs text-destructive">{referenceError}</p>}

              <div className="max-h-64 overflow-y-auto rounded-lg border p-3">
                <div className="grid gap-3">
                  {(customVerses.length > 0 ? customVerses : [currentVerseContext]).map((item) => {
                    const isImplicitCurrent = customVerses.length === 0

                    return (
                      <div key={verseKey(item)} className="rounded-lg border bg-muted/40 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-xs font-semibold">{item.reference}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({item.translation.toUpperCase()})</span>
                          </div>
                          {!isImplicitCurrent && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeVerseFromContext(item)}
                              title="Quitar versiculo"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <p className="mt-1 text-sm">{item.text}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {user ? (
              <div className="shrink-0 space-y-3">
                <div className="grid grid-cols-2 rounded-md border bg-muted/40 p-1">
                  <Button
                    type="button"
                    variant={depth === 'brief' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setDepth('brief')}
                  >
                    Breve
                  </Button>
                  <Button
                    type="button"
                    variant={depth === 'deep' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setDepth('deep')}
                  >
                    Profundo
                  </Button>
                </div>
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full gap-2">
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isAnalyzing ? 'Analizando...' : depth === 'deep' ? 'Comparar versículos profundo' : 'Comparar versículos breve'}
                </Button>
              </div>
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
            <div className="mt-4 max-h-72 overflow-y-auto rounded-lg border bg-primary/5 p-4">
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
            </div>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
