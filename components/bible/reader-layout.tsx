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
import { BookOpen, Search, Bookmark, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    theme: 'light'
  })
  const [bookSelectorOpen, setBookSelectorOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center justify-between h-14 px-4">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline">Biblia</span>
          </Link>

          {/* Center: Book/Chapter Selector */}
          <Button
            variant="ghost"
            onClick={() => setBookSelectorOpen(true)}
            className="gap-1"
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
            <AIChat currentContext={{ book: bookName, chapter }} />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-3xl mx-auto px-4 py-6">
        {children}
      </main>

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
