'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ReadingProgress } from '@/lib/bible/types'
import { getBookmarks, getHighlights, getReadingProgress } from '@/lib/bible/storage'
import { getBook } from '@/lib/bible/api'
import { getSpanishBookName } from '@/lib/bible/book-names'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { AdUnit } from '@/components/ads/ad-unit'
import { GoogleSession } from '@/components/auth/google-session'
import {
  ArrowRight,
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  CalendarDays,
  Heart,
  Library,
  MessageSquareText,
  Search,
  Sparkles
} from 'lucide-react'

const popularChapters = [
  { book: 'genesis', chapter: 1, label: 'Genesis 1', description: 'La creacion y el origen de todo' },
  { book: 'psalms', chapter: 23, label: 'Salmos 23', description: 'Confianza, cuidado y descanso' },
  { book: 'john', chapter: 3, label: 'Juan 3', description: 'Nuevo nacimiento y amor de Dios' },
  { book: 'matthew', chapter: 5, label: 'Mateo 5', description: 'El sermon del monte' }
]

const quickActions = [
  { label: 'Leer Biblia', href: '/read/rvr/genesis/1', icon: BookOpen },
  { label: 'Comparar versiones', href: '/read/rvr/john/1', icon: Library },
  { label: 'Analisis IA', href: '/read/rvr/psalms/23', icon: Brain },
  { label: 'Devocionales', href: '/read/rvr/matthew/5', icon: CalendarDays },
  { label: 'Favoritos', href: '/bookmarks', icon: Heart }
]

export default function HomePage() {
  const [progress, setProgress] = useState<ReadingProgress | null>(null)
  const [progressBookName, setProgressBookName] = useState('')
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [highlightCount, setHighlightCount] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const savedProgress = getReadingProgress()
    const bookmarks = getBookmarks()
    const highlights = getHighlights()

    setProgress(savedProgress)
    setBookmarkCount(bookmarks.length)
    setHighlightCount(highlights.length)

    if (savedProgress) {
      const book = getBook(savedProgress.book)
      setProgressBookName(getSpanishBookName(savedProgress.book, book?.name || savedProgress.book))
    }
  }, [])

  const searchHref = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return '/read/rvr/genesis/1'

    const reference = value.match(/^([a-zA-ZáéíóúñüÁÉÍÓÚÑÜ0-9\s]+)\s+(\d{1,3})(?::(\d{1,3}))?$/)
    if (reference?.[1] && reference?.[2]) {
      const bookText = reference[1].trim()
      const bookMap: Record<string, string> = {
        genesis: 'genesis',
        'génesis': 'genesis',
        salmos: 'psalms',
        salmo: 'psalms',
        juan: 'john',
        mateo: 'matthew'
      }
      const bookId = bookMap[bookText] || 'genesis'
      return `/read/rvr/${bookId}/${reference[2]}`
    }

    return '/read/rvr/genesis/1'
  }, [query])

  return (
    <div className="min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="h-5 w-5" />
            </span>
            <span>Asistente Biblico</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/read/rvr/genesis/1" className="hover:text-foreground">Leer</Link>
            <Link href="/read/rvr/john/1" className="hover:text-foreground">Comparar</Link>
            <Link href="/bookmarks" className="hover:text-foreground">Guardados</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground sm:flex">
              <span className="font-medium text-foreground">ES</span>
              <span>/</span>
              <span title="Proximamente">EN</span>
            </div>
            <GoogleSession />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col px-4 pb-20">
        <section className="grid min-h-[620px] items-center gap-10 py-12 md:grid-cols-[1.08fr_.92fr] md:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              Lectura biblica, estudio e IA en un solo lugar
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Lee, compara y comprende la Biblia con claridad.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Una plataforma moderna para lectura biblica, versiones, favoritos, notas y analisis inteligente de versiculos.
            </p>

            <div className="mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm">
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                placeholder="Buscar Juan 3:16, amor, fe, creacion..."
              />
              <Button asChild>
                <Link href={searchHref}>Buscar</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/read/rvr/genesis/1">
                  Empezar lectura
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/read/rvr/john/1">
                  <Sparkles className="h-4 w-4" />
                  Analizar con IA
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
            <Card className="premium-surface relative overflow-hidden rounded-3xl">
              <CardHeader className="border-b bg-gradient-to-br from-primary/10 via-transparent to-secondary/20">
                <CardDescription>Versiculo del dia</CardDescription>
                <CardTitle className="font-serif text-2xl leading-relaxed">
                  En el principio creo Dios los cielos y la tierra.
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-4">
                  <div>
                    <p className="text-sm font-medium">Genesis 1:1</p>
                    <p className="text-xs text-muted-foreground">Reina-Valera</p>
                  </div>
                  <Button variant="secondary" asChild>
                    <Link href="/read/rvr/genesis/1">Abrir</Link>
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl border bg-card p-3">
                    <p className="text-xl font-semibold">66</p>
                    <p className="text-xs text-muted-foreground">Libros</p>
                  </div>
                  <div className="rounded-2xl border bg-card p-3">
                    <p className="text-xl font-semibold">IA</p>
                    <p className="text-xs text-muted-foreground">Estudio</p>
                  </div>
                  <div className="rounded-2xl border bg-card p-3">
                    <p className="text-xl font-semibold">ES</p>
                    <p className="text-xs text-muted-foreground">Biblia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-5">
          {quickActions.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="premium-surface group flex items-center gap-3 rounded-2xl p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <Card className="premium-surface rounded-3xl">
            <CardHeader>
              <CardDescription>Continua tu camino</CardDescription>
              <CardTitle>{progress ? `${progressBookName} ${progress.chapter}` : 'Empieza en Genesis 1'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 h-2 rounded-full bg-muted">
                <div className="h-2 w-1/3 rounded-full bg-primary" />
              </div>
              <Button asChild>
                <Link href={progress ? `/read/rvr/${progress.book}/${progress.chapter}` : '/read/rvr/genesis/1'}>
                  {progress ? 'Continuar lectura' : 'Comenzar lectura'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="premium-surface rounded-3xl">
            <CardHeader>
              <CardDescription>Tu actividad</CardDescription>
              <CardTitle>Resumen personal</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-muted/60 p-3 text-center">
                <BookMarked className="mx-auto mb-2 h-4 w-4 text-primary" />
                <p className="text-lg font-semibold">{bookmarkCount}</p>
                <p className="text-xs text-muted-foreground">Favoritos</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3 text-center">
                <MessageSquareText className="mx-auto mb-2 h-4 w-4 text-primary" />
                <p className="text-lg font-semibold">{highlightCount}</p>
                <p className="text-xs text-muted-foreground">Marcados</p>
              </div>
              <div className="rounded-2xl bg-muted/60 p-3 text-center">
                <BarChart3 className="mx-auto mb-2 h-4 w-4 text-primary" />
                <p className="text-lg font-semibold">1</p>
                <p className="text-xs text-muted-foreground">Racha</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Lecturas sugeridas</h2>
              <p className="text-sm text-muted-foreground">Pasajes para empezar una sesion de estudio.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularChapters.map((chapter) => (
              <Card key={`${chapter.book}-${chapter.chapter}`} className="premium-surface rounded-2xl transition hover:border-primary/30 hover:shadow-md">
                <Link href={`/read/rvr/${chapter.book}/${chapter.chapter}`}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">{chapter.label}</CardTitle>
                    <CardDescription>{chapter.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        <AdUnit placement="home" className="mt-12 max-w-4xl" />
      </main>
    </div>
  )
}
