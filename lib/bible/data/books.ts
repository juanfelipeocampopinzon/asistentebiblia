import { Book } from '../types'

export const books: Book[] = [
  // Old Testament
  { id: 'genesis', name: 'Genesis', abbreviation: 'Gen', testament: 'old', chapters: 50, order: 1 },
  { id: 'exodus', name: 'Exodus', abbreviation: 'Exod', testament: 'old', chapters: 40, order: 2 },
  { id: 'leviticus', name: 'Leviticus', abbreviation: 'Lev', testament: 'old', chapters: 27, order: 3 },
  { id: 'numbers', name: 'Numbers', abbreviation: 'Num', testament: 'old', chapters: 36, order: 4 },
  { id: 'deuteronomy', name: 'Deuteronomy', abbreviation: 'Deut', testament: 'old', chapters: 34, order: 5 },
  { id: 'joshua', name: 'Joshua', abbreviation: 'Josh', testament: 'old', chapters: 24, order: 6 },
  { id: 'judges', name: 'Judges', abbreviation: 'Judg', testament: 'old', chapters: 21, order: 7 },
  { id: 'ruth', name: 'Ruth', abbreviation: 'Ruth', testament: 'old', chapters: 4, order: 8 },
  { id: '1-samuel', name: '1 Samuel', abbreviation: '1 Sam', testament: 'old', chapters: 31, order: 9 },
  { id: '2-samuel', name: '2 Samuel', abbreviation: '2 Sam', testament: 'old', chapters: 24, order: 10 },
  { id: '1-kings', name: '1 Kings', abbreviation: '1 Kgs', testament: 'old', chapters: 22, order: 11 },
  { id: '2-kings', name: '2 Kings', abbreviation: '2 Kgs', testament: 'old', chapters: 25, order: 12 },
  { id: '1-chronicles', name: '1 Chronicles', abbreviation: '1 Chr', testament: 'old', chapters: 29, order: 13 },
  { id: '2-chronicles', name: '2 Chronicles', abbreviation: '2 Chr', testament: 'old', chapters: 36, order: 14 },
  { id: 'ezra', name: 'Ezra', abbreviation: 'Ezra', testament: 'old', chapters: 10, order: 15 },
  { id: 'nehemiah', name: 'Nehemiah', abbreviation: 'Neh', testament: 'old', chapters: 13, order: 16 },
  { id: 'esther', name: 'Esther', abbreviation: 'Esth', testament: 'old', chapters: 10, order: 17 },
  { id: 'job', name: 'Job', abbreviation: 'Job', testament: 'old', chapters: 42, order: 18 },
  { id: 'psalms', name: 'Psalms', abbreviation: 'Ps', testament: 'old', chapters: 150, order: 19 },
  { id: 'proverbs', name: 'Proverbs', abbreviation: 'Prov', testament: 'old', chapters: 31, order: 20 },
  { id: 'ecclesiastes', name: 'Ecclesiastes', abbreviation: 'Eccl', testament: 'old', chapters: 12, order: 21 },
  { id: 'song-of-solomon', name: 'Song of Solomon', abbreviation: 'Song', testament: 'old', chapters: 8, order: 22 },
  { id: 'isaiah', name: 'Isaiah', abbreviation: 'Isa', testament: 'old', chapters: 66, order: 23 },
  { id: 'jeremiah', name: 'Jeremiah', abbreviation: 'Jer', testament: 'old', chapters: 52, order: 24 },
  { id: 'lamentations', name: 'Lamentations', abbreviation: 'Lam', testament: 'old', chapters: 5, order: 25 },
  { id: 'ezekiel', name: 'Ezekiel', abbreviation: 'Ezek', testament: 'old', chapters: 48, order: 26 },
  { id: 'daniel', name: 'Daniel', abbreviation: 'Dan', testament: 'old', chapters: 12, order: 27 },
  { id: 'hosea', name: 'Hosea', abbreviation: 'Hos', testament: 'old', chapters: 14, order: 28 },
  { id: 'joel', name: 'Joel', abbreviation: 'Joel', testament: 'old', chapters: 3, order: 29 },
  { id: 'amos', name: 'Amos', abbreviation: 'Amos', testament: 'old', chapters: 9, order: 30 },
  { id: 'obadiah', name: 'Obadiah', abbreviation: 'Obad', testament: 'old', chapters: 1, order: 31 },
  { id: 'jonah', name: 'Jonah', abbreviation: 'Jonah', testament: 'old', chapters: 4, order: 32 },
  { id: 'micah', name: 'Micah', abbreviation: 'Mic', testament: 'old', chapters: 7, order: 33 },
  { id: 'nahum', name: 'Nahum', abbreviation: 'Nah', testament: 'old', chapters: 3, order: 34 },
  { id: 'habakkuk', name: 'Habakkuk', abbreviation: 'Hab', testament: 'old', chapters: 3, order: 35 },
  { id: 'zephaniah', name: 'Zephaniah', abbreviation: 'Zeph', testament: 'old', chapters: 3, order: 36 },
  { id: 'haggai', name: 'Haggai', abbreviation: 'Hag', testament: 'old', chapters: 2, order: 37 },
  { id: 'zechariah', name: 'Zechariah', abbreviation: 'Zech', testament: 'old', chapters: 14, order: 38 },
  { id: 'malachi', name: 'Malachi', abbreviation: 'Mal', testament: 'old', chapters: 4, order: 39 },
  
  // New Testament
  { id: 'matthew', name: 'Matthew', abbreviation: 'Matt', testament: 'new', chapters: 28, order: 40 },
  { id: 'mark', name: 'Mark', abbreviation: 'Mark', testament: 'new', chapters: 16, order: 41 },
  { id: 'luke', name: 'Luke', abbreviation: 'Luke', testament: 'new', chapters: 24, order: 42 },
  { id: 'john', name: 'John', abbreviation: 'John', testament: 'new', chapters: 21, order: 43 },
  { id: 'acts', name: 'Acts', abbreviation: 'Acts', testament: 'new', chapters: 28, order: 44 },
  { id: 'romans', name: 'Romans', abbreviation: 'Rom', testament: 'new', chapters: 16, order: 45 },
  { id: '1-corinthians', name: '1 Corinthians', abbreviation: '1 Cor', testament: 'new', chapters: 16, order: 46 },
  { id: '2-corinthians', name: '2 Corinthians', abbreviation: '2 Cor', testament: 'new', chapters: 13, order: 47 },
  { id: 'galatians', name: 'Galatians', abbreviation: 'Gal', testament: 'new', chapters: 6, order: 48 },
  { id: 'ephesians', name: 'Ephesians', abbreviation: 'Eph', testament: 'new', chapters: 6, order: 49 },
  { id: 'philippians', name: 'Philippians', abbreviation: 'Phil', testament: 'new', chapters: 4, order: 50 },
  { id: 'colossians', name: 'Colossians', abbreviation: 'Col', testament: 'new', chapters: 4, order: 51 },
  { id: '1-thessalonians', name: '1 Thessalonians', abbreviation: '1 Thess', testament: 'new', chapters: 5, order: 52 },
  { id: '2-thessalonians', name: '2 Thessalonians', abbreviation: '2 Thess', testament: 'new', chapters: 3, order: 53 },
  { id: '1-timothy', name: '1 Timothy', abbreviation: '1 Tim', testament: 'new', chapters: 6, order: 54 },
  { id: '2-timothy', name: '2 Timothy', abbreviation: '2 Tim', testament: 'new', chapters: 4, order: 55 },
  { id: 'titus', name: 'Titus', abbreviation: 'Titus', testament: 'new', chapters: 3, order: 56 },
  { id: 'philemon', name: 'Philemon', abbreviation: 'Phlm', testament: 'new', chapters: 1, order: 57 },
  { id: 'hebrews', name: 'Hebrews', abbreviation: 'Heb', testament: 'new', chapters: 13, order: 58 },
  { id: 'james', name: 'James', abbreviation: 'Jas', testament: 'new', chapters: 5, order: 59 },
  { id: '1-peter', name: '1 Peter', abbreviation: '1 Pet', testament: 'new', chapters: 5, order: 60 },
  { id: '2-peter', name: '2 Peter', abbreviation: '2 Pet', testament: 'new', chapters: 3, order: 61 },
  { id: '1-john', name: '1 John', abbreviation: '1 John', testament: 'new', chapters: 5, order: 62 },
  { id: '2-john', name: '2 John', abbreviation: '2 John', testament: 'new', chapters: 1, order: 63 },
  { id: '3-john', name: '3 John', abbreviation: '3 John', testament: 'new', chapters: 1, order: 64 },
  { id: 'jude', name: 'Jude', abbreviation: 'Jude', testament: 'new', chapters: 1, order: 65 },
  { id: 'revelation', name: 'Revelation', abbreviation: 'Rev', testament: 'new', chapters: 22, order: 66 },
]

export function getBook(id: string): Book | undefined {
  return books.find(b => b.id === id)
}

export function getBooksByTestament(testament: 'old' | 'new'): Book[] {
  return books.filter(b => b.testament === testament)
}

export function getNextBook(currentBookId: string): Book | undefined {
  const currentBook = getBook(currentBookId)
  if (!currentBook) return undefined
  return books.find(b => b.order === currentBook.order + 1)
}

export function getPreviousBook(currentBookId: string): Book | undefined {
  const currentBook = getBook(currentBookId)
  if (!currentBook) return undefined
  return books.find(b => b.order === currentBook.order - 1)
}
