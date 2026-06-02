'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { askBibleAI } from '@/lib/bible/ai'
import { useAuth } from '@/lib/auth/google-auth'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIChatProps {
  currentContext?: {
    book: string
    chapter: number
    verse?: number
  }
}

export function AIChat({ currentContext }: AIChatProps) {
  const { user, isConfigured, login } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hola. Soy tu asistente biblico IA. Te respondo breve y claro. Que quieres revisar?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const question = input.trim()
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: question,
        timestamp: new Date()
      }
    ])
    setInput('')
    setIsLoading(true)

    try {
      const contextText = currentContext
        ? `Contexto de lectura: ${currentContext.book} ${currentContext.chapter}${currentContext.verse ? `:${currentContext.verse}` : ''}.\n`
        : ''
      const aiResult = await askBibleAI(
        `${contextText}Responde en espanol, maximo 60 palabras, directo y facil de leer.\nPregunta: ${question}`
      )

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResult.response,
          timestamp: new Date()
        }
      ])
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'No pude conectar con la IA.',
          timestamp: new Date()
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    'Que significa Juan 3:16?',
    'Como puedo orar mejor?',
    'Mensaje de Genesis?',
    'Que dice sobre el amor?'
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <MessageCircle className="h-5 w-5" />
          <Sparkles className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-primary" />
          <span className="sr-only">Asistente IA</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md h-dvh flex flex-col p-0">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Asistente Biblico IA
          </SheetTitle>
        </SheetHeader>

        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  message.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted'
                )}>
                  {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={cn(
                  'rounded-lg px-3 py-2 max-w-[82%]',
                  message.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                )}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {messages.length === 1 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Preguntas sugeridas:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => setInput(question)}
                      className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t shrink-0">
          {!user && (
            <div className="mb-3 rounded-md border bg-muted/40 p-3 text-center text-sm">
              <p className="text-muted-foreground">Inicia sesión con Google para usar la IA.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={!isConfigured}
                onClick={login}
              >
                Entrar con Google
              </Button>
            </div>
          )}
          <form
            onSubmit={(event) => {
              event.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Pregunta sobre la Biblia..."
              disabled={isLoading || !user}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !user}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Respuestas breves generadas por el microservicio biblico
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
