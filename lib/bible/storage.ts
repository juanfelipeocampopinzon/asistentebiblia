// Local storage utilities for bookmarks, highlights, and reading progress
// These will be migrated to your Java backend when it's ready

import { Bookmark, Highlight, ReadingProgress, ReaderSettings, HighlightColor } from './types'

const STORAGE_KEYS = {
  bookmarks: 'bible-bookmarks',
  highlights: 'bible-highlights',
  progress: 'bible-reading-progress',
  settings: 'bible-reader-settings'
} as const

// Generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Bookmarks
export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.bookmarks)
  return data ? JSON.parse(data) : []
}

export function addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
  const bookmarks = getBookmarks()
  const newBookmark: Bookmark = {
    ...bookmark,
    id: generateId(),
    createdAt: new Date().toISOString()
  }
  bookmarks.push(newBookmark)
  localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks))
  return newBookmark
}

export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks().filter(b => b.id !== id)
  localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks))
}

export function isBookmarked(book: string, chapter: number, verse?: number): Bookmark | undefined {
  const bookmarks = getBookmarks()
  return bookmarks.find(b => 
    b.book === book && 
    b.chapter === chapter && 
    (verse === undefined || b.verse === verse)
  )
}

// Highlights
export function getHighlights(): Highlight[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.highlights)
  return data ? JSON.parse(data) : []
}

export function addHighlight(highlight: Omit<Highlight, 'id' | 'createdAt'>): Highlight {
  const highlights = getHighlights()
  
  // Remove existing highlight for same verse if exists
  const filtered = highlights.filter(h => 
    !(h.book === highlight.book && 
      h.chapter === highlight.chapter && 
      h.verse === highlight.verse)
  )
  
  const newHighlight: Highlight = {
    ...highlight,
    id: generateId(),
    createdAt: new Date().toISOString()
  }
  filtered.push(newHighlight)
  localStorage.setItem(STORAGE_KEYS.highlights, JSON.stringify(filtered))
  return newHighlight
}

export function removeHighlight(id: string): void {
  const highlights = getHighlights().filter(h => h.id !== id)
  localStorage.setItem(STORAGE_KEYS.highlights, JSON.stringify(highlights))
}

export function getHighlightForVerse(book: string, chapter: number, verse: number): Highlight | undefined {
  const highlights = getHighlights()
  return highlights.find(h => 
    h.book === book && 
    h.chapter === chapter && 
    h.verse === verse
  )
}

export function getHighlightsForChapter(book: string, chapter: number): Highlight[] {
  const highlights = getHighlights()
  return highlights.filter(h => h.book === book && h.chapter === chapter)
}

// Reading Progress
export function getReadingProgress(): ReadingProgress | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(STORAGE_KEYS.progress)
  return data ? JSON.parse(data) : null
}

export function saveReadingProgress(progress: Omit<ReadingProgress, 'lastRead'>): void {
  const fullProgress: ReadingProgress = {
    ...progress,
    lastRead: new Date().toISOString()
  }
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(fullProgress))
}

// Reader Settings
const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 'lg',
  fontFamily: 'serif',
  lineHeight: 'relaxed',
  columnWidth: 'comfortable',
  theme: 'light'
}

export function getReaderSettings(): ReaderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  const data = localStorage.getItem(STORAGE_KEYS.settings)
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS
}

export function saveReaderSettings(settings: Partial<ReaderSettings>): ReaderSettings {
  const current = getReaderSettings()
  const updated = { ...current, ...settings }
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(updated))
  return updated
}

// Highlight colors with their Tailwind classes
export const highlightColors: Record<HighlightColor, { bg: string; text: string; name: string }> = {
  yellow: { bg: 'bg-yellow-200 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-200', name: 'Yellow' },
  green: { bg: 'bg-green-200 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200', name: 'Green' },
  blue: { bg: 'bg-blue-200 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200', name: 'Blue' },
  pink: { bg: 'bg-pink-200 dark:bg-pink-900/50', text: 'text-pink-800 dark:text-pink-200', name: 'Pink' },
  orange: { bg: 'bg-orange-200 dark:bg-orange-900/50', text: 'text-orange-800 dark:text-orange-200', name: 'Orange' },
}
