// Утилиты для Participant Manager Widget

import type {
  ParticipantSuggestion,
  ArtistCredit,
  ParticipantRow,
  ParticipantRole,
  ParticipantValidationResult,
  ParticipantSearchResult,
  PlatformLink
} from '../types/participant.types'
import { DEMO_PARTICIPANTS } from '../data/demoParticipants'

// ========== Валидация участников ==========

export const validateParticipant = (participant: ArtistCredit): ParticipantValidationResult => {
  const errors: Record<string, string> = {}
  
  if (!participant.displayName?.trim()) {
    errors.displayName = 'Имя участника обязательно'
  }
  
  if (!participant.role) {
    errors.role = 'Роль участника обязательна'
  }
  


  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}





// ========== Поиск и фильтрация ==========

export const searchParticipants = (
  participants: ParticipantSuggestion[],
  query: string,
  options: {
    limit?: number
    roles?: ParticipantRole[]
    platforms?: string[]
  } = {}
): ParticipantSearchResult => {
  const { limit = 10, roles, platforms } = options
  
  // Используем демо-данные для поиска
  
  // Используем демо-данные если участники не переданы
  const searchData = participants.length > 0 ? participants : DEMO_PARTICIPANTS
  
  if (!query.trim()) {
    return { suggestions: [], hasMore: false, total: 0 }
  }
  
  const searchTerm = query.toLowerCase().trim()
  
  let filtered = searchData.filter(participant => {
    // Поиск по имени
    const nameMatch = participant.displayName.toLowerCase().includes(searchTerm) ||
                     (participant.realName && participant.realName.toLowerCase().includes(searchTerm)) ||
                     (participant.description && participant.description.toLowerCase().includes(searchTerm))
    
    if (!nameMatch) return false
    
    // Фильтр по ролям
    if (roles && roles.length > 0) {
      const hasRole = participant.roles.some(role => roles.includes(role as ParticipantRole))
      if (!hasRole) return false
    }
    
    // Фильтр по платформам
    if (platforms && platforms.length > 0) {
      const hasPlatform = participant.platformLinks?.some(link => 
        platforms.includes(link.platform)
      )
      if (!hasPlatform) return false
    }
    
    return true
  })
  
  // Сортировка по релевантности
  filtered = filtered.sort((a, b) => {
    const aStartsWith = a.displayName.toLowerCase().startsWith(searchTerm)
    const bStartsWith = b.displayName.toLowerCase().startsWith(searchTerm)
    
    if (aStartsWith && !bStartsWith) return -1
    if (!aStartsWith && bStartsWith) return 1
    
    return a.displayName.localeCompare(b.displayName)
  })
  
  const suggestions = filtered.slice(0, limit)
  
  return {
    suggestions,
    hasMore: filtered.length > limit,
    total: filtered.length
  }
}

// ========== Управление участниками ==========

export const createParticipantRow = (participant: ArtistCredit, index: number): ParticipantRow => {
  return {
    ...participant,
    id: participant.id || `participant-${index}-${Date.now()}`
  }
}

export const convertToParticipantRows = (participants: ArtistCredit[]): ParticipantRow[] => {
  return participants.map((participant, index) => createParticipantRow(participant, index))
}

// ========== Преобразование данных ==========

export const participantSuggestionToArtistCredit = (
  suggestion: ParticipantSuggestion,
  role: ParticipantRole = 'MainArtist'
): ArtistCredit => {
  return {
    id: suggestion.id,
    displayName: suggestion.displayName,
    role
  }
}

// ========== Платформы и ссылки ==========

export const validatePlatformLink = (link: PlatformLink): boolean => {
  if (!link.url || !link.platform) return false
  
  try {
    const url = new URL(link.url)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export const getPlatformLinks = (participant: ParticipantSuggestion): PlatformLink[] => {
  return participant.platformLinks?.filter(link => validatePlatformLink(link)) || []
}

export const addPlatformLink = (
  participant: ParticipantSuggestion,
  link: PlatformLink
): ParticipantSuggestion => {
  const existingLinks = participant.platformLinks || []
  const updatedLinks = [...existingLinks, link]
  
  return {
    ...participant,
    platformLinks: updatedLinks
  }
}

export const removePlatformLink = (
  participant: ParticipantSuggestion,
  platform: string
): ParticipantSuggestion => {
  const updatedLinks = (participant.platformLinks || []).filter(
    link => link.platform !== platform
  )
  
  return {
    ...participant,
    platformLinks: updatedLinks
  }
}

// ========== Экспорт вспомогательных функций ==========



export const generateParticipantId = (): string => {
  return `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const isValidParticipantName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100
}