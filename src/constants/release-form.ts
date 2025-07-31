import { 
  Crown, Star, FileText, Music, Settings, Mic, Headphones, Volume2, Disc3, Piano
} from 'lucide-react'

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

export const PARTICIPANT_ROLES = {
  MainArtist: { displayName: 'Основной исполнитель', icon: Crown },
  FeaturedArtist: { displayName: 'Приглашенный исполнитель', icon: Star },
  Remixer: { displayName: 'Ремиксер', icon: Disc3 },
  Producer: { displayName: 'Продюсер', icon: Settings },
  Vocalist: { displayName: 'Вокалист', icon: Mic },
  Songwriter: { displayName: 'Автор текста', icon: FileText },
  Composer: { displayName: 'Композитор', icon: Music },
  Arranger: { displayName: 'Аранжировщик', icon: Piano },
  MixEngineer: { displayName: 'Звукорежиссер сведения', icon: Headphones },
  MasteringEngineer: { displayName: 'Звукорежиссер мастеринга', icon: Volume2 }
}

 