import Link from 'next/link'
import { SiteFooter } from '@/components/site/site-footer'
import { BookOpen } from 'lucide-react'

interface LegalPageProps {
  title: string
  description: string
  children: React.ReactNode
}

export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" />
            </span>
            Kairos Bible
          </Link>
          <Link href="/read/rvr/genesis/1" className="text-sm text-muted-foreground hover:text-foreground">
            Leer Biblia
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-12">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-primary">Informacion legal</p>
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{description}</p>
        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-primary">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
