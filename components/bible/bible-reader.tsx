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
  onVerseSelect?: (verse: Verse) => void
}

export function BibleReader({
  chapter,
  fontSize,
  fontFamily,
  lineHeight,
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

  return (
    <div className={cn('relative', fontFamilyClass, fontSizeClass, lineHeightClass)}>
      {/* Chapter Title */}
      <h1 className="text-2xl font-semibold mb-6 text-center">
        {chapter.bookName} {chapter.chapter}
      </h1>

      {/* Verses */}
      <div className="space-y-3 md:space-y-4">
        {chapter.verses.map((verse) => {
          const highlight = getHighlightForVerse(verse.number)
          const isSelected = selectedVerse === verse.number
          
          return (
            <p
              key={verse.number}
              onClick={() => handleVerseClick(verse)}
              className={cn(
                'verse-text cursor-pointer rounded-md px-2 py-1.5 transition-colors',
                highlight && highlightColors[highlight.color].bg,
                isSelected && 'ring-2 ring-primary',
                !highlight && 'hover:bg-accent/50'
              )}
            >
              <sup className="verse-number">{verse.number}</sup>
              {verse.text}
            </p>
          )
        })}
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
    </div>
  )
}
