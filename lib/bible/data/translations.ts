import { Translation } from '../types'

export const translations: Translation[] = [
  {
    id: 'rvr',
    name: 'Reina-Valera',
    abbreviation: 'RVR',
    language: 'Español',
    description: 'Texto bíblico en español cargado desde Firestore'
  }
]

export function getTranslation(id: string): Translation | undefined {
  return translations.find(t => t.id === id)
}

export function getDefaultTranslation(): Translation {
  return translations[0]
}
