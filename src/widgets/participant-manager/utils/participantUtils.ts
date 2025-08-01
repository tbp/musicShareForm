// Утилиты для Participant Manager Widget

import type {
  ParticipantSuggestion,
  ArtistCredit,
  ParticipantRow,
  ParticipantRole,
  ParticipantValidationResult,
  ParticipantStats,
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
  
  if (participant.share < 0 || participant.share > 100) {
    errors.share = 'Доля должна быть от 0 до 100%'
  }
  
  if (participant.copyrightShare !== undefined && (participant.copyrightShare < 0 || participant.copyrightShare > 100)) {
    errors.copyrightShare = 'Доля авторских прав должна быть от 0 до 100%'
  }
  
  if (participant.relatedRightsShare !== undefined && (participant.relatedRightsShare < 0 || participant.relatedRightsShare > 100)) {
    errors.relatedRightsShare = 'Доля смежных прав должна быть от 0 до 100%'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export const validateParticipantsList = (participants: ArtistCredit[]): ParticipantValidationResult => {
  const errors: Record<string, string> = {}
  const warnings: string[] = []
  
  if (participants.length === 0) {
    errors.participants = 'Добавьте хотя бы одного участника'
    return { isValid: false, errors, warnings }
  }
  
  // Проверка уникальности имен в одной роли
  const roleNames = new Map<string, Set<string>>()
  
  participants.forEach((participant, index) => {
    const validation = validateParticipant(participant)
    if (!validation.isValid) {
      Object.entries(validation.errors).forEach(([field, error]) => {
        errors[`participant_${index}_${field}`] = error
      })
    }
    
    // Группируем по ролям для проверки дублирования
    const key = `${participant.role}_${participant.displayName.trim().toLowerCase()}`
    if (!roleNames.has(participant.role)) {
      roleNames.set(participant.role, new Set())
    }
    
    const names = roleNames.get(participant.role)!
    if (names.has(participant.displayName.trim().toLowerCase())) {
      warnings.push(`Участник "${participant.displayName}" дублируется в роли "${participant.role}"`)
    } else {
      names.add(participant.displayName.trim().toLowerCase())
    }
  })
  
  // Проверка долей
  const totalShare = participants.reduce((sum, p) => sum + (p.share || 0), 0)
  if (Math.abs(totalShare - 100) > 0.01 && totalShare > 0) {
    warnings.push(`Сумма долей участников: ${totalShare.toFixed(1)}%. Рекомендуется 100%`)
  }
  
  // Проверка авторских прав
  const totalCopyright = participants.reduce((sum, p) => sum + (p.copyrightShare || 0), 0)
  if (totalCopyright > 100) {
    errors.copyrightShare = `Сумма авторских прав превышает 100%: ${totalCopyright}%`
  }
  
  // Проверка смежных прав
  const totalRelatedRights = participants.reduce((sum, p) => sum + (p.relatedRightsShare || 0), 0)
  if (totalRelatedRights > 100) {
    errors.relatedRightsShare = `Сумма смежных прав превышает 100%: ${totalRelatedRights}%`
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// ========== Статистика участников ==========

export const getParticipantStats = (participants: ArtistCredit[]): ParticipantStats => {
  const byRole = participants.reduce((acc, participant) => {
    acc[participant.role] = (acc[participant.role] || 0) + 1
    return acc
  }, {} as Record<ParticipantRole, number>)
  
  const totalCopyrightShare = participants.reduce((sum, p) => sum + (p.copyrightShare || 0), 0)
  const totalRelatedRightsShare = participants.reduce((sum, p) => sum + (p.relatedRightsShare || 0), 0)
  
  const validation = validateParticipantsList(participants)
  
  return {
    total: participants.length,
    byRole,
    totalCopyrightShare,
    totalRelatedRightsShare,
    isComplete: validation.isValid
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

export const reorderParticipants = <T>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] => {
  const result = [...items]
  const [removed] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, removed)
  return result
}

// ========== Преобразование данных ==========

export const participantSuggestionToArtistCredit = (
  suggestion: ParticipantSuggestion,
  role: ParticipantRole = 'MainArtist',
  share: number = 0
): ArtistCredit => {
  return {
    id: suggestion.id,
    displayName: suggestion.displayName,
    role,
    share,
    copyrightShare: 0,
    relatedRightsShare: 0
  }
}

export const artistCreditToParticipantSuggestion = (
  credit: ArtistCredit,
  platformLinks: PlatformLink[] = []
): ParticipantSuggestion => {
  return {
    id: credit.id || `temp-${Date.now()}`,
    displayName: credit.displayName,
    roles: [credit.role],
    platformLinks
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

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100) / 100}%`
}

export const generateParticipantId = (): string => {
  return `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const isValidParticipantName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 100
}