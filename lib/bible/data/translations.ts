import { Translation } from '../types'

export const translations: Translation[] = [
  {
    id: 'rvr',
    name: 'Reina-Valera',
    abbreviation: 'RVR',
    language: 'Español',
    description: 'Texto bíblico en español cargado desde Firestore',
    available: true
  },
  {
    id: 'kjv',
    name: 'King James Version',
    abbreviation: 'KJV',
    language: 'English',
    description: 'Texto completo disponible para comparación',
    available: true
  },
  {
    id: 'niv',
    name: 'New International Version',
    abbreviation: 'NIV',
    language: 'English',
    description: 'Pendiente por licencia/fuente autorizada',
    available: false
  },
  {
    id: 'esv',
    name: 'English Standard Version',
    abbreviation: 'ESV',
    language: 'English',
    description: 'Pendiente por licencia/fuente autorizada',
    available: false
  },
  {
    id: 'nlt',
    name: 'New Living Translation',
    abbreviation: 'NLT',
    language: 'English',
    description: 'Pendiente por licencia/fuente autorizada',
    available: false
  }
]

export function getTranslation(id: string): Translation | undefined {
  return translations.find(t => t.id === id)
}

export function getDefaultTranslation(): Translation {
  return translations[0]
}
