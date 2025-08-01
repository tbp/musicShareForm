// Константы ролей участников для Participant Manager Widget

import { 
  Crown, Star, FileText, Music, Settings, Mic, Headphones, Volume2, Disc3, Piano
} from 'lucide-react'

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