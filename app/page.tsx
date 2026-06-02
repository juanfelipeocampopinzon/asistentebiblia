'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ReadingProgress } from '@/lib/bible/types'
import { getReadingProgress } from '@/lib/bible/storage'
import { getBook } from '@/lib/bible/api'
import { getSpanishBookName } from '@/lib/bible/book-names'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, ArrowRight, Sparkles, Bookmark, Search } from 'lucide-react'

const popularChapters = [
  { book: 'genesis', chapter: 1, label: 'Génesis 1', description: 'La creación' },
  { book: 'psalms', chapter: 23, label: 'Salmos 23', description: 'Jehová es mi pastor' },
  { book: 'john', chapter: 3, label: 'Juan 3', description: 'El amor de Dios' },
  { book: 'matthew', chapter: 5, label: 'Mateo 5', description: 'El sermón del monte' },
]

export default function HomePage() {
  const [progress, setProgress] = useState<ReadingProgress | null>(null)
  const [progressBookName, setProgressBookName] = useState('')

  useEffect(() => {
    const savedProgress = getReadingProgress()
    setProgress(savedProgress)
    if (savedProgress) {
      const book = getBook(savedProgress.book)
      setProgressBookName(getSpanishBookName(savedProgress.book, book?.name || savedProgress.book))
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/90">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-5 w-5 text-primary" />
            Biblia IA
          </Link>
          <div className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">ES</span>
            <span>/</span>
            <span title="Próximamente">EN</span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col px-4 py-10 md:py-14">
        <section className="mx-auto w-full max-w-3xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Lee la Biblia en español
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Una plataforma sencilla para leer, buscar, guardar y estudiar la Biblia con ayuda de IA.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/read/rvr/genesis/1">
                Empezar lectura
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/bookmarks">
                <Bookmark className="mr-2 h-4 w-4" />
                Mis guardados
              </Link>
            </Button>
          </div>
        </section>

        {progress && (
          <section className="mx-auto mt-10 w-full max-w-3xl">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardDescription>Continúa donde quedaste</CardDescription>
                <CardTitle>{progressBookName} {progress.chapter}</CardTitle>
                <div className="pt-2">
                  <Button asChild>
                    <Link href={`/read/rvr/${progress.book}/${progress.chapter}`}>
                      Continuar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </section>
        )}

        <section className="mx-auto mt-10 w-full max-w-3xl">
          <h2 className="mb-4 text-xl font-semibold">Lecturas sugeridas</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {popularChapters.map((chapter) => (
              <Card key={`${chapter.book}-${chapter.chapter}`} className="transition-colors hover:bg-accent/50">
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

        <section className="mx-auto mt-12 w-full max-w-3xl">
          <h2 className="mb-6 text-center text-xl font-semibold">Herramientas</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">Guardados</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vuelve a tus pasajes favoritos.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">IA bíblica</h3>
              <p className="mt-1 text-sm text-muted-foreground">Explica y compara versículos.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium">Búsqueda</h3>
              <p className="mt-1 text-sm text-muted-foreground">Encuentra palabras o frases.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
