'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReaderSettings, Book, SearchResult } from '@/lib/bible/types'
import { getReaderSettings, saveReaderSettings } from '@/lib/bible/storage'
import { Button } from '@/components/ui/button'
import { BookSelector } from './book-selector'
import { TranslationPicker } from './translation-picker'
import { ReaderSettingsSheet } from './reader-settings'
import { SearchDialog } from './search-dialog'
import { AIChat } from './ai-chat'
import { BookOpen, Search, Bookmark, ChevronDown, Home, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoogleSession } from '@/components/auth/google-session'

interface ReaderLayoutProps {
  children: React.ReactNode
  bookId: string
  bookName: string
  chapter: number
  translation: string
  onNavigate: (book: string, chapter: number, translation: string) => void
}

export function ReaderLayout({
  children,
  bookId,
  bookName,
  chapter,
  translation,
  onNavigate
}: ReaderLayoutProps) {
  const router = useRouter()
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 'lg',
    fontFamily: 'serif',
    lineHeight: 'relaxed',
    columnWidth: 'comfortable',
    theme: 'light'
  })
  const [bookSelectorOpen, setBookSelectorOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)

  useEffect(() => {
    setSettings(getReaderSettings())
  }, [])

  useEffect(() => {
    // Apply theme class to html element
    const html = document.documentElement
    html.classList.remove('dark', 'sepia')
    if (settings.theme === 'dark') {
      html.classList.add('dark')
    } else if (settings.theme === 'sepia') {
      html.classList.add('sepia')
    }
  }, [settings.theme])

  const handleSettingsChange = (newSettings: Partial<ReaderSettings>) => {
    const updated = saveReaderSettings(newSettings)
    setSettings(updated)
  }

  const handleBookSelect = (book: Book, chapterNum?: number) => {
    onNavigate(book.id, chapterNum || 1, translation)
  }

  const handleTranslationChange = (newTranslation: string) => {
    onNavigate(bookId, chapter, newTranslation)
  }

  const handleSearchResult = (result: SearchResult) => {
    onNavigate(result.book, result.chapter, result.translation)
  }

  return (
    <div className={cn('min-h-screen bg-background', focusMode && 'bg-muted/30')}>
      {/* Header */}
      <header className={cn(
        'sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl transition-transform',
        focusMode && '-translate-y-full md:translate-y-0 md:bg-background/55'
      )}>
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="hidden sm:inline">Asistente Biblico</span>
          </Link>

          {/* Center: Book/Chapter Selector */}
          <Button
            variant="ghost"
            onClick={() => setBookSelectorOpen(true)}
            className="h-10 gap-1 rounded-full border bg-card px-4 shadow-sm"
          >
            <span className="font-medium">{bookName} {chapter}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <TranslationPicker
              value={translation}
              onChange={handleTranslationChange}
            />
            <div className="hidden lg:block">
              <GoogleSession />
            </div>
            <div className="hidden sm:block">
              <AIChat currentContext={{ book: bookName, chapter }} />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:inline-flex"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Buscar</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <Link href="/bookmarks">
                <Bookmark className="h-5 w-5" />
                <span className="sr-only">Guardados</span>
              </Link>
            </Button>
            <ReaderSettingsSheet
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFocusMode(value => !value)}
              title={focusMode ? 'Salir de modo concentracion' : 'Modo concentracion'}
            >
              {focusMode ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              <span className="sr-only">Modo concentracion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn('mx-auto w-full px-4 pb-24 pt-6 transition-all md:pb-10', focusMode ? 'max-w-3xl' : 'max-w-4xl')}>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur-xl sm:hidden">
        <div className="mx-auto grid h-16 max-w-md grid-cols-5 px-2 text-xs">
          <Link href="/" className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <Home className="h-5 w-5" />
            Inicio
          </Link>
          <button type="button" onClick={() => setBookSelectorOpen(true)} className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            Leer
          </button>
          <button type="button" onClick={() => setSearchOpen(true)} className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <Search className="h-5 w-5" />
            Buscar
          </button>
          <div className="flex items-center justify-center">
            <AIChat currentContext={{ book: bookName, chapter }} />
          </div>
          <Link href="/bookmarks" className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
            <Bookmark className="h-5 w-5" />
            Guardados
          </Link>
        </div>
      </nav>

      {/* Book Selector Dialog */}
      <BookSelector
        open={bookSelectorOpen}
        onOpenChange={setBookSelectorOpen}
        currentBook={bookId}
        onSelectBook={handleBookSelect}
      />

      {/* Search Dialog */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        translation={translation}
        onResultClick={handleSearchResult}
      />
    </div>
  )
}
