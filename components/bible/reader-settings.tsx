'use client'

import { ReaderSettings } from '@/lib/bible/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Settings, Sun, Moon, BookOpen, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReaderSettingsSheetProps {
  settings: ReaderSettings
  onSettingsChange: (settings: Partial<ReaderSettings>) => void
}

const fontSizes = [
  { value: 'sm', label: 'S' },
  { value: 'base', label: 'M' },
  { value: 'lg', label: 'L' },
  { value: 'xl', label: 'XL' },
  { value: '2xl', label: '2XL' },
] as const

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'sepia', label: 'Sepia', icon: BookOpen },
] as const

export function ReaderSettingsSheet({ settings, onSettingsChange }: ReaderSettingsSheetProps) {
  const currentSizeIndex = fontSizes.findIndex(f => f.value === settings.fontSize)

  const decreaseSize = () => {
    if (currentSizeIndex > 0) {
      onSettingsChange({ fontSize: fontSizes[currentSizeIndex - 1].value })
    }
  }

  const increaseSize = () => {
    if (currentSizeIndex < fontSizes.length - 1) {
      onSettingsChange({ fontSize: fontSizes[currentSizeIndex + 1].value })
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Reader settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reading Settings</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Font Size */}
          <div className="space-y-2">
            <Label>Font Size</Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseSize}
                disabled={currentSizeIndex === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className={cn(
                  'font-serif',
                  settings.fontSize === 'sm' && 'text-sm',
                  settings.fontSize === 'base' && 'text-base',
                  settings.fontSize === 'lg' && 'text-lg',
                  settings.fontSize === 'xl' && 'text-xl',
                  settings.fontSize === '2xl' && 'text-2xl',
                )}>
                  Aa
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseSize}
                disabled={currentSizeIndex === fontSizes.length - 1}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>Font Style</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={settings.fontFamily === 'serif' ? 'default' : 'outline'}
                onClick={() => onSettingsChange({ fontFamily: 'serif' })}
                className="font-serif"
              >
                Serif
              </Button>
              <Button
                variant={settings.fontFamily === 'sans' ? 'default' : 'outline'}
                onClick={() => onSettingsChange({ fontFamily: 'sans' })}
                className="font-sans"
              >
                Sans
              </Button>
            </div>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label>Line Spacing</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.lineHeight === 'normal' ? 'default' : 'outline'}
                onClick={() => onSettingsChange({ lineHeight: 'normal' })}
                size="sm"
              >
                Tight
              </Button>
              <Button
                variant={settings.lineHeight === 'relaxed' ? 'default' : 'outline'}
                onClick={() => onSettingsChange({ lineHeight: 'relaxed' })}
                size="sm"
              >
                Normal
              </Button>
              <Button
                variant={settings.lineHeight === 'loose' ? 'default' : 'outline'}
                onClick={() => onSettingsChange({ lineHeight: 'loose' })}
                size="sm"
              >
                Loose
              </Button>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={settings.theme === value ? 'default' : 'outline'}
                  onClick={() => onSettingsChange({ theme: value })}
                  className="flex-col h-auto py-3 gap-1"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
