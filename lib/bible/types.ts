// Bible data types - designed to work with your future Java backend

export interface Translation {
  id: string
  name: string
  abbreviation: string
  language: string
  description?: string
}

export interface Book {
  id: string
  name: string
  abbreviation: string
  testament: 'old' | 'new'
  chapters: number
  order: number
}

export interface Verse {
  number: number
  text: string
}

export interface Chapter {
  book: string
  bookName: string
  chapter: number
  verses: Verse[]
  translation: string
}

export interface SearchResult {
  book: string
  bookName: string
  chapter: number
  verse: number
  text: string
  translation: string
}

export interface Bookmark {
  id: string
  book: string
  chapter: number
  verse?: number
  translation: string
  note?: string
  createdAt: string
}

export interface Highlight {
  id: string
  book: string
  chapter: number
  verse: number
  translation: string
  color: HighlightColor
  createdAt: string
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange'

export interface ReadingProgress {
  book: string
  chapter: number
  translation: string
  scrollPosition?: number
  lastRead: string
}

export interface ReaderSettings {
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl'
  fontFamily: 'serif' | 'sans'
  lineHeight: 'normal' | 'relaxed' | 'loose'
  theme: 'light' | 'dark' | 'sepia'
}
