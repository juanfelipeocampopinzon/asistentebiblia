'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Chapter, ReaderSettings } from '@/lib/bible/types'
import { getChapter, getChapterNavigation, getBook } from '@/lib/bible/api'
import { getReaderSettings, saveReadingProgress } from '@/lib/bible/storage'
import { ReaderLayout } from '@/components/bible/reader-layout'
import { BibleReader } from '@/components/bible/bible-reader'
import { ChapterNav } from '@/components/bible/chapter-nav'
import { Skeleton } from '@/components/ui/skeleton'
import { AdUnit } from '@/components/ads/ad-unit'

interface PageProps {
  params: Promise<{
    translation: string
    book: string
    chapter: string
  }>
}

export default function ReadPage({ params }: PageProps) {
  const { translation, book, chapter: chapterStr } = use(params)
  const router = useRouter()
  const chapterNum = parseInt(chapterStr, 10)

  const [chapterData, setChapterData] = useState<Chapter | null>(null)
  const [settings, setSettings] = useState<ReaderSettings | null>(null)
  const [navigation, setNavigation] = useState<{
    currentBook: { name: string; chapters: number }
    prevChapter: { book: string; chapter: number } | null
    nextChapter: { book: string; chapter: number } | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      
      // Load chapter data and navigation info
      const [chapter, nav, readerSettings] = await Promise.all([
        getChapter(book, chapterNum, translation),
        getChapterNavigation(book, chapterNum),
        Promise.resolve(getReaderSettings())
      ])

      setChapterData(chapter)
      setNavigation(nav)
      setSettings(readerSettings)
      setLoading(false)

      // Save reading progress
      if (chapter) {
        saveReadingProgress({
          book,
          chapter: chapterNum,
          translation
        })
      }
    }

    loadData()
  }, [book, chapterNum, translation])

  const handleNavigate = (newBook: string, newChapter: number, newTranslation: string) => {
    router.push(`/read/${newTranslation}/${newBook}/${newChapter}`)
  }

  const handlePrevious = () => {
    if (navigation?.prevChapter) {
      handleNavigate(navigation.prevChapter.book, navigation.prevChapter.chapter, translation)
    }
  }

  const handleNext = () => {
    if (navigation?.nextChapter) {
      handleNavigate(navigation.nextChapter.book, navigation.nextChapter.chapter, translation)
    }
  }

  if (loading || !settings) {
    return (
      <ReaderLayout
        bookId={book}
        bookName="Cargando"
        chapter={chapterNum}
        translation={translation}
        onNavigate={handleNavigate}
      >
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </ReaderLayout>
    )
  }

  if (!chapterData) {
    return (
      <ReaderLayout
        bookId={book}
        bookName={book}
        chapter={chapterNum}
        translation={translation}
        onNavigate={handleNavigate}
      >
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Capítulo no encontrado</h2>
          <p className="text-muted-foreground">
            No se pudo cargar este capítulo. Selecciona otro libro o capítulo.
          </p>
        </div>
      </ReaderLayout>
    )
  }

  return (
    <ReaderLayout
      bookId={book}
      bookName={chapterData.bookName}
      chapter={chapterNum}
      translation={translation}
      onNavigate={handleNavigate}
    >
      <BibleReader
        chapter={chapterData}
        fontSize={settings.fontSize}
        fontFamily={settings.fontFamily}
        lineHeight={settings.lineHeight}
        columnWidth={settings.columnWidth}
      />
      
      {navigation && (
        <ChapterNav
          bookName={chapterData.bookName}
          chapter={chapterNum}
          totalChapters={navigation.currentBook.chapters}
          onPrevious={handlePrevious}
          onNext={handleNext}
          hasPrevious={!!navigation.prevChapter}
          hasNext={!!navigation.nextChapter}
        />
      )}

      <AdUnit placement="reader" className="mt-8 max-w-3xl" />
    </ReaderLayout>
  )
}
