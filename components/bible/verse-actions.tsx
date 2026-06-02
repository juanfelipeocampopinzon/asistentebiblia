'use client'

import { Verse, HighlightColor } from '@/lib/bible/types'
import { addBookmark, isBookmarked, removeBookmark, highlightColors } from '@/lib/bible/storage'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck, Copy, Share2, X, Highlighter } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { AICompare } from './ai-compare'
import { AIExplain } from './ai-explain'

interface VerseActionsProps {
  verse: Verse
  book: string
  bookName: string
  chapter: number
  translation: string
  hasHighlight: boolean
  onHighlight: (color: HighlightColor) => void
  onRemoveHighlight: () => void
  onClose: () => void
}

export function VerseActions({
  verse,
  book,
  bookName,
  chapter,
  translation,
  hasHighlight,
  onHighlight,
  onRemoveHighlight,
  onClose
}: VerseActionsProps) {
  const [bookmarked, setBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showHighlightColors, setShowHighlightColors] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bookmark = isBookmarked(book, chapter, verse.number)
    setBookmarked(!!bookmark)
  }, [book, chapter, verse.number])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-slot="dialog-content"]')) {
        return
      }

      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleBookmark = () => {
    if (bookmarked) {
      const bookmark = isBookmarked(book, chapter, verse.number)
      if (bookmark) {
        removeBookmark(bookmark.id)
        setBookmarked(false)
      }
    } else {
      addBookmark({
        book,
        chapter,
        verse: verse.number,
        translation
      })
      setBookmarked(true)
    }
  }

  const handleCopy = async () => {
    const text = `${bookName} ${chapter}:${verse.number} - "${verse.text}"`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    const text = `${bookName} ${chapter}:${verse.number} - "${verse.text}"`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await handleCopy()
    }
  }

  return (
    <div 
      ref={ref}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border rounded-lg shadow-lg p-2 flex items-center gap-1"
    >
      <div className="text-xs text-muted-foreground px-2 border-r mr-1">
        {bookName} {chapter}:{verse.number}
      </div>
      
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleBookmark}
        title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {bookmarked ? (
          <BookmarkCheck className="h-4 w-4 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4" />
        )}
      </Button>

      <div className="relative">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setShowHighlightColors(!showHighlightColors)}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        
        {showHighlightColors && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border rounded-lg shadow-lg p-2 flex gap-1">
            {(Object.keys(highlightColors) as HighlightColor[]).map((color) => (
              <button
                key={color}
                onClick={() => {
                  onHighlight(color)
                  setShowHighlightColors(false)
                }}
                className={`w-6 h-6 rounded-full ${highlightColors[color].bg} border-2 border-transparent hover:border-foreground/30 transition-colors`}
                title={highlightColors[color].name}
              />
            ))}
            {hasHighlight && (
              <button
                onClick={() => {
                  onRemoveHighlight()
                  setShowHighlightColors(false)
                }}
                className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors"
                title="Remove highlight"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy verse'}
      >
        <Copy className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleShare}
        title="Share verse"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <div className="border-l mx-1 h-6" />

      <AIExplain
        verse={verse}
        book={book}
        bookName={bookName}
        chapter={chapter}
        translation={translation}
      />

      <AICompare
        verse={verse}
        book={book}
        bookName={bookName}
        chapter={chapter}
        translation={translation}
      />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        className="ml-1"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
