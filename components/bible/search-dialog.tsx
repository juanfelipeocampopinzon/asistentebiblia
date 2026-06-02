'use client'

import { useState, useCallback, useEffect } from 'react'
import { SearchResult } from '@/lib/bible/types'
import { searchBible } from '@/lib/bible/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Loader2 } from 'lucide-react'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  translation: string
  onResultClick: (result: SearchResult) => void
}

export function SearchDialog({ open, onOpenChange, translation, onResultClick }: SearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setSearched(true)
    try {
      const searchResults = await searchBible(query, translation)
      setResults(searchResults)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, translation])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result)
    onOpenChange(false)
    setQuery('')
    setResults([])
    setSearched(false)
  }

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setSearched(false)
    }
  }, [open])

  // Highlight search query in text
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery.trim()) return text
    
    const regex = new RegExp(`(${searchQuery})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search Bible</DialogTitle>
          <DialogDescription className="sr-only">
            Search Bible verses in the current translation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="Search for words or phrases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        <ScrollArea className="h-[50vh] mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium text-sm text-primary">
                    {result.bookName} {result.chapter}:{result.verse}
                  </div>
                  <div className="text-sm text-foreground mt-1 line-clamp-2">
                    {highlightText(result.text, query)}
                  </div>
                </button>
              ))}
            </div>
          ) : searched ? (
            <div className="text-center py-8 text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Enter a word or phrase to search the Bible
            </div>
          )}
        </ScrollArea>

        <p className="text-xs text-muted-foreground mt-2">
          La búsqueda consulta el microservicio bíblico desplegado.
        </p>
      </DialogContent>
    </Dialog>
  )
}
