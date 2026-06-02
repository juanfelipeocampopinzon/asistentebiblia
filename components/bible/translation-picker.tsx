'use client'

import { Translation } from '@/lib/bible/types'
import { translations } from '@/lib/bible/data/translations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TranslationPickerProps {
  value: string
  onChange: (translationId: string) => void
}

export function TranslationPicker({ value, onChange }: TranslationPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[82px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {translations.map((translation) => (
            <SelectItem key={translation.id} value={translation.id}>
              <span className="font-medium">{translation.abbreviation}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="hidden items-center rounded-md border px-2 py-1 text-xs text-muted-foreground sm:flex">
        <span className="font-medium text-foreground">ES</span>
        <span className="mx-1">/</span>
        <span title="Próximamente">EN</span>
      </div>
    </div>
  )
}
