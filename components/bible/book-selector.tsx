'use client'

import { useState } from 'react'
import { Book } from '@/lib/bible/types'
import { books } from '@/lib/bible/data/books'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { getSpanishBookName } from '@/lib/bible/book-names'

interface BookSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBook: string
  onSelectBook: (book: Book, chapter?: number) => void
}

export function BookSelector({ open, onOpenChange, currentBook, onSelectBook }: BookSelectorProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  
  const oldTestament = books.filter(b => b.testament === 'old')
  const newTestament = books.filter(b => b.testament === 'new')

  const handleBookClick = (book: Book) => {
    setSelectedBook(book)
  }

  const handleChapterClick = (chapter: number) => {
    if (selectedBook) {
      onSelectBook(selectedBook, chapter)
      setSelectedBook(null)
      onOpenChange(false)
    }
  }

  const handleBack = () => {
    setSelectedBook(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {selectedBook ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleBack}>
                  Back
                </Button>
                <span>{getSpanishBookName(selectedBook.id, selectedBook.name)}</span>
              </div>
            ) : (
              'Select Book'
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose a Bible book and chapter.
          </DialogDescription>
        </DialogHeader>

        {selectedBook ? (
          // Chapter Grid
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-5 gap-2 p-2">
              {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                <Button
                  key={chapter}
                  variant="outline"
                  size="sm"
                  onClick={() => handleChapterClick(chapter)}
                  className="h-10"
                >
                  {chapter}
                </Button>
              ))}
            </div>
          </ScrollArea>
        ) : (
          // Book List
          <Tabs defaultValue="old" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="old">Old Testament</TabsTrigger>
              <TabsTrigger value="new">New Testament</TabsTrigger>
            </TabsList>
            
            <TabsContent value="old">
              <ScrollArea className="h-[55vh]">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {oldTestament.map((book) => (
                    <Button
                      key={book.id}
                      variant={book.id === currentBook ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleBookClick(book)}
                      className={cn(
                        'justify-start text-left h-auto py-2',
                        book.id === currentBook && 'bg-accent'
                      )}
                    >
                      <span className="truncate">{getSpanishBookName(book.id, book.name)}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{book.chapters}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="new">
              <ScrollArea className="h-[55vh]">
                <div className="grid grid-cols-2 gap-1 p-2">
                  {newTestament.map((book) => (
                    <Button
                      key={book.id}
                      variant={book.id === currentBook ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => handleBookClick(book)}
                      className={cn(
                        'justify-start text-left h-auto py-2',
                        book.id === currentBook && 'bg-accent'
                      )}
                    >
                      <span className="truncate">{getSpanishBookName(book.id, book.name)}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{book.chapters}</span>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
