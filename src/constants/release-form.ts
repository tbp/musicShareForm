export const PARENTAL_ADVISORY_OPTIONS = [
  { 
    value: 'NotExplicit', 
    label: 'Не присутствует', 
    hint: 'Контент подходит для всех возрастов'
  },
  { 
    value: 'Explicit', 
    label: 'Присутствует', 
    hint: 'Содержит ненормативную лексику или взрослый контент'
  },
  { 
    value: 'Edited', 
    label: 'Запикано', 
    hint: 'Ненормативная лексика заглушена или заменена'
  }
]

export const RELEASE_TYPES = [
  { value: 'Album', label: 'Альбом' },
  { value: 'Single', label: 'Сингл' },
  { value: 'EP', label: 'EP' },
  { value: 'Compilation', label: 'Сборник' }
] 