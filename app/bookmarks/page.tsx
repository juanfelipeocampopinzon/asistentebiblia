'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bookmark, Highlight } from '@/lib/bible/types'
import { getBookmarks, getHighlights, removeBookmark, removeHighlight, highlightColors } from '@/lib/bible/storage'
import { getBook } from '@/lib/bible/api'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Bookmark as BookmarkIcon, Highlighter, Trash2, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])

  useEffect(() => {
    setBookmarks(getBookmarks())
    setHighlights(getHighlights())
  }, [])

  const handleRemoveBookmark = (id: string) => {
    removeBookmark(id)
    setBookmarks(getBookmarks())
  }

  const handleRemoveHighlight = (id: string) => {
    removeHighlight(id)
    setHighlights(getHighlights())
  }

  const getBookName = (bookId: string) => {
    const book = getBook(bookId)
    return book?.name || bookId
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex items-center h-14 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/read">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to reading</span>
            </Link>
          </Button>
          <h1 className="ml-2 font-semibold">Bookmarks & Highlights</h1>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6">
        <Tabs defaultValue="bookmarks">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bookmarks" className="gap-2">
              <BookmarkIcon className="h-4 w-4" />
              Bookmarks ({bookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="highlights" className="gap-2">
              <Highlighter className="h-4 w-4" />
              Highlights ({highlights.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookmarks" className="mt-4">
            {bookmarks.length === 0 ? (
              <div className="text-center py-12">
                <BookmarkIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 font-medium">No bookmarks yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tap on a verse while reading to bookmark it
                </p>
                <Button asChild className="mt-4">
                  <Link href="/read">Start Reading</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {bookmarks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Link
                      href={`/read/${bookmark.translation}/${bookmark.book}/${bookmark.chapter}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="font-medium">
                        {getBookName(bookmark.book)} {bookmark.chapter}
                        {bookmark.verse && `:${bookmark.verse}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(bookmark.createdAt).toLocaleDateString()}
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveBookmark(bookmark.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="highlights" className="mt-4">
            {highlights.length === 0 ? (
              <div className="text-center py-12">
                <Highlighter className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 font-medium">No highlights yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tap on a verse while reading to highlight it
                </p>
                <Button asChild className="mt-4">
                  <Link href="/read">Start Reading</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {highlights.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((highlight) => (
                  <div
                    key={highlight.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className={cn('w-3 h-3 rounded-full', highlightColors[highlight.color].bg)} />
                    <Link
                      href={`/read/${highlight.translation}/${highlight.book}/${highlight.chapter}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="font-medium">
                        {getBookName(highlight.book)} {highlight.chapter}:{highlight.verse}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(highlight.createdAt).toLocaleDateString()}
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveHighlight(highlight.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
