'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Chapter, Verse, Highlight, HighlightColor } from '@/lib/bible/types'
import { getHighlightsForChapter, addHighlight, removeHighlight, highlightColors } from '@/lib/bible/storage'
import { VerseActions } from './verse-actions'

interface BibleReaderProps {
  chapter: Chapter
  fontSize: string
  fontFamily: string
  lineHeight: string
  columnWidth?: string
  onVerseSelect?: (verse: Verse) => void
}

export function BibleReader({
  chapter,
  fontSize,
  fontFamily,
  lineHeight,
  columnWidth = 'comfortable',
  onVerseSelect
}: BibleReaderProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null)
  const [showActions, setShowActions] = useState(false)

  useEffect(() => {
    setHighlights(getHighlightsForChapter(chapter.book, chapter.chapter))
  }, [chapter.book, chapter.chapter])

  const handleVerseClick = useCallback((verse: Verse) => {
    setSelectedVerse(verse.number)
    setShowActions(true)
    onVerseSelect?.(verse)
  }, [onVerseSelect])

  const handleHighlight = useCallback((color: HighlightColor) => {
    if (selectedVerse === null) return
    
    addHighlight({
      book: chapter.book,
      chapter: chapter.chapter,
      verse: selectedVerse,
      translation: chapter.translation,
      color
    })
    setHighlights(getHighlightsForChapter(chapter.book, chapter.chapter))
    setShowActions(false)
    setSelectedVerse(null)
  }, [selectedVerse, chapter])

  const handleRemoveHighlight = useCallback(() => {
    if (selectedVerse === null) return
    
    const highlight = highlights.find(h => h.verse === selectedVerse)
    if (highlight) {
      removeHighlight(highlight.id)
      setHighlights(getHighlightsForChapter(chapter.book, chapter.chapter))
    }
    setShowActions(false)
    setSelectedVerse(null)
  }, [selectedVerse, highlights, chapter])

  const handleCloseActions = useCallback(() => {
    setShowActions(false)
    setSelectedVerse(null)
  }, [])

  const getHighlightForVerse = (verseNumber: number) => {
    return highlights.find(h => h.verse === verseNumber)
  }

  const fontSizeClass = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  }[fontSize] || 'text-lg'

  const fontFamilyClass = fontFamily === 'serif' ? 'font-serif' : 'font-sans'
  
  const lineHeightClass = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  }[lineHeight] || 'leading-relaxed'

  const columnWidthClass = {
    narrow: 'max-w-[620px]',
    comfortable: 'max-w-[740px]',
    wide: 'max-w-[880px]'
  }[columnWidth] || 'max-w-[740px]'

  return (
    <article className={cn('relative mx-auto w-full', columnWidthClass, fontFamilyClass, fontSizeClass, lineHeightClass)}>
      {/* Chapter Title */}
      <header className="mb-8 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {chapter.translation.toUpperCase()}
        </p>
        <h1 className="font-sans text-3xl font-semibold tracking-tight md:text-4xl">
          {chapter.bookName} {chapter.chapter}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Toca un versiculo para guardar, resaltar, comparar versiones o analizarlo con IA.
        </p>
      </header>

      {/* Verses */}
      <div className="rounded-[1.5rem] border bg-card/70 px-3 py-4 shadow-sm backdrop-blur md:px-6 md:py-7">
        <div className="space-y-2 md:space-y-3">
        {chapter.verses.map((verse) => {
          const highlight = getHighlightForVerse(verse.number)
          const isSelected = selectedVerse === verse.number
          
          return (
            <p
              key={verse.number}
              onClick={() => handleVerseClick(verse)}
              className={cn(
                'verse-text cursor-pointer rounded-xl px-3 py-2 transition-all focus-visible:ring-2 focus-visible:ring-ring',
                highlight && highlightColors[highlight.color].bg,
                isSelected && 'bg-primary/10 ring-2 ring-primary/50',
                !highlight && 'hover:bg-accent/60'
              )}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleVerseClick(verse)
                }
              }}
            >
              <sup className="verse-number">{verse.number}</sup>
              {verse.text}
            </p>
          )
        })}
        </div>
      </div>

      {/* Verse Actions Popover */}
      {showActions && selectedVerse !== null && (
        <VerseActions
          verse={chapter.verses.find(v => v.number === selectedVerse)!}
          book={chapter.book}
          bookName={chapter.bookName}
          chapter={chapter.chapter}
          translation={chapter.translation}
          hasHighlight={!!getHighlightForVerse(selectedVerse)}
          onHighlight={handleHighlight}
          onRemoveHighlight={handleRemoveHighlight}
          onClose={handleCloseActions}
        />
      )}
    </article>
  )
}
