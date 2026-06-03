import { Chapter, SearchResult, Book, Translation } from './types'
import { books, getBook, getNextBook, getPreviousBook } from './data/books'
import { translations } from './data/translations'
import { spanishBookNames } from './book-names'

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, '') || ''

async function fetchFromBackend<T>(path: string): Promise<T | null> {
  if (!backendUrl) return null

  const response = await fetch(`${backendUrl}${path}`)
  if (!response.ok) return null
  return response.json()
}

export async function getChapter(
  bookId: string,
  chapter: number,
  translationId: string = 'rvr'
): Promise<Chapter | null> {
  const remoteChapter = await fetchFromBackend<Chapter>(
    `/api/bible/books/${bookId}/chapters/${chapter}?translation=${encodeURIComponent(translationId)}`
  )

  if (remoteChapter) return remoteChapter

  const book = getBook(bookId)
  if (!book || chapter < 1 || chapter > book.chapters) return null

  return {
    book: bookId,
    bookName: book.name,
    chapter,
    translation: translationId,
    verses: [
      {
        number: 1,
        text: 'No se pudo cargar este capítulo desde el backend. Revisa NEXT_PUBLIC_BACKEND_URL y el estado del microservicio.'
      }
    ]
  }
}

export async function getTranslations(): Promise<Translation[]> {
  const remoteTranslations = await fetchFromBackend<Translation[]>('/api/bible/translations')
  return remoteTranslations?.length ? remoteTranslations : translations
}

export async function getBooks(): Promise<Book[]> {
  const remoteBooks = await fetchFromBackend<Book[]>('/api/bible/books')
  return remoteBooks?.length ? remoteBooks : books
}

export async function searchBible(
  query: string,
  translationId: string = 'rvr',
  limit: number = 20
): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const params = new URLSearchParams({
    q: query,
    translation: translationId,
    limit: String(limit)
  })

  return (await fetchFromBackend<SearchResult[]>(`/api/bible/search?${params.toString()}`)) || []
}

export interface VerseComparison {
  translation: string
  abbreviation: string
  name: string
  language: string
  text: string
}

export async function compareVerseTranslations(
  bookId: string,
  chapter: number,
  verse: number,
  translationIds: string[] = ['rvr', 'kjv']
): Promise<VerseComparison[]> {
  const params = new URLSearchParams({
    translations: translationIds.join(',')
  })

  return (await fetchFromBackend<VerseComparison[]>(
    `/api/bible/compare/${bookId}/${chapter}/${verse}?${params.toString()}`
  )) || []
}

export interface ResolvedVerseReference {
  book: string
  bookName: string
  chapter: number
  verse: number
  text: string
  translation: string
  reference: string
}

function normalizeReferenceText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function getBookAliases() {
  const aliases = new Map<string, string>()

  books.forEach((book) => {
    aliases.set(normalizeReferenceText(book.id.replace(/-/g, ' ')), book.id)
    aliases.set(normalizeReferenceText(book.name), book.id)
    aliases.set(normalizeReferenceText(book.abbreviation), book.id)

    const spanishName = spanishBookNames[book.id]
    if (spanishName) {
      aliases.set(normalizeReferenceText(spanishName), book.id)
    }
  })

  Object.entries({
    gen: 'genesis',
    gn: 'genesis',
    ex: 'exodus',
    exo: 'exodus',
    num: 'numbers',
    dt: 'deuteronomy',
    salmo: 'psalms',
    salmos: 'psalms',
    sal: 'psalms',
    pr: 'proverbs',
    prov: 'proverbs',
    is: 'isaiah',
    jer: 'jeremiah',
    mt: 'matthew',
    mateo: 'matthew',
    mc: 'mark',
    marcos: 'mark',
    lc: 'luke',
    lucas: 'luke',
    jn: 'john',
    juan: 'john',
    hch: 'acts',
    hechos: 'acts',
    ro: 'romans',
    rom: 'romans',
    col: 'colossians',
    heb: 'hebrews',
    ap: 'revelation',
    apocalipsis: 'revelation'
  }).forEach(([alias, bookId]) => aliases.set(normalizeReferenceText(alias), bookId))

  return aliases
}

export function parseVerseReference(reference: string): { book: string; chapter: number; verse: number } | null {
  const match = reference.trim().match(/^(.+?)\s+(\d{1,3})\s*:\s*(\d{1,3})$/)
  if (!match) return null

  const [, bookText, chapterText, verseText] = match
  const book = getBookAliases().get(normalizeReferenceText(bookText))
  if (!book) return null

  return {
    book,
    chapter: Number(chapterText),
    verse: Number(verseText)
  }
}

export async function getVerseByReference(
  reference: string,
  translationId: string = 'rvr'
): Promise<ResolvedVerseReference | null> {
  const parsed = parseVerseReference(reference)
  if (!parsed) return null

  const chapter = await getChapter(parsed.book, parsed.chapter, translationId)
  const verse = chapter?.verses.find(item => item.number === parsed.verse)
  if (!chapter || !verse) return null

  return {
    book: chapter.book,
    bookName: chapter.bookName,
    chapter: chapter.chapter,
    verse: verse.number,
    text: verse.text,
    translation: chapter.translation,
    reference: `${chapter.bookName} ${chapter.chapter}:${verse.number}`
  }
}

export async function getChapterNavigation(bookId: string, chapter: number) {
  const allBooks = await getBooks()
  const book = allBooks.find(b => b.id === bookId) || getBook(bookId)
  if (!book) return null

  const hasPrevChapter = chapter > 1
  const hasNextChapter = chapter < book.chapters
  const prevBook =
    allBooks.find(b => b.order === book.order - 1) ||
    getPreviousBook(bookId)
  const nextBook =
    allBooks.find(b => b.order === book.order + 1) ||
    getNextBook(bookId)

  return {
    currentBook: book,
    prevChapter: hasPrevChapter
      ? { book: bookId, chapter: chapter - 1 }
      : prevBook
        ? { book: prevBook.id, chapter: prevBook.chapters }
        : null,
    nextChapter: hasNextChapter
      ? { book: bookId, chapter: chapter + 1 }
      : nextBook
        ? { book: nextBook.id, chapter: 1 }
        : null
  }
}

export { getBook, getNextBook, getPreviousBook }
export { books, translations }
