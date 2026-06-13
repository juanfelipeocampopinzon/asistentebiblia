import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t bg-background/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BookOpen className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Kairos Bible</p>
            <p>Lee, compara y estudia la Biblia con IA.</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/about" className="hover:text-foreground">Sobre</Link>
          <Link href="/privacy" className="hover:text-foreground">Privacidad</Link>
          <Link href="/terms" className="hover:text-foreground">Terminos</Link>
          <Link href="/ai-disclaimer" className="hover:text-foreground">Uso de IA</Link>
          <Link href="/advertising" className="hover:text-foreground">Anuncios</Link>
          <Link href="/contact" className="hover:text-foreground">Contacto</Link>
        </nav>
      </div>
    </footer>
  )
}
