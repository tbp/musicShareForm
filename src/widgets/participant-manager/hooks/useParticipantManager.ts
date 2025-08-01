// Хук для управления участниками релиза

import { useState, useCallback, useMemo } from 'react'
import type {
  ArtistCredit,
  ParticipantSuggestion,
  ParticipantRow,
  ParticipantManagerState,
  ParticipantManagerActions,
  ParticipantValidationResult,
  ParticipantStats
} from '../types/participant.types'
import {
  validateParticipantsList,
  getParticipantStats,
  searchParticipants,
  convertToParticipantRows,
  reorderParticipants,
  participantSuggestionToArtistCredit,
  generateParticipantId
} from '../utils/participantUtils'

interface UseParticipantManagerOptions {
  initialParticipants?: ArtistCredit[]
  suggestions?: ParticipantSuggestion[]
  enableVariousArtists?: boolean
  onParticipantsChange?: (participants: ArtistCredit[]) => void
  onValidationChange?: (validation: ParticipantValidationResult) => void
}

export function useParticipantManager(options: UseParticipantManagerOptions = {}) {
  const {
    initialParticipants = [],
    suggestions = [],
    enableVariousArtists = false,
    onParticipantsChange,
    onValidationChange
  } = options

  // ========== Состояние ==========
  
  const [participants, setParticipants] = useState<ArtistCredit[]>(initialParticipants)
  const [isVariousArtistsEnabled, setIsVariousArtistsEnabled] = useState(enableVariousArtists)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantSuggestion | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // ========== Вычисляемые значения ==========
  
  const participantRows = useMemo(() => convertToParticipantRows(participants), [participants])
  
  const validation = useMemo(() => {
    const result = validateParticipantsList(participants)
    onValidationChange?.(result)
    return result
  }, [participants, onValidationChange])
  
  const stats = useMemo(() => getParticipantStats(participants), [participants])
  
  const suggestionsForSearch = useMemo(() => suggestions, [suggestions])

  // ========== Основные действия ==========
  
  const updateParticipants = useCallback((newParticipants: ArtistCredit[]) => {
    setParticipants(newParticipants)
    onParticipantsChange?.(newParticipants)
    
    // Очищаем ошибки при изменении
    setErrors({})
  }, [onParticipantsChange])

  const addParticipant = useCallback((participant: ArtistCredit) => {
    const newParticipant = {
      ...participant,
      id: participant.id || generateParticipantId()
    }
    
    updateParticipants([...participants, newParticipant])
  }, [participants, updateParticipants])

  const updateParticipant = useCallback((index: number, field: string, value: any) => {
    if (index < 0 || index >= participants.length) return
    
    const newParticipants = [...participants]
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: value
    }
    
    updateParticipants(newParticipants)
  }, [participants, updateParticipants])

  const removeParticipant = useCallback((index: number) => {
    if (index < 0 || index >= participants.length) return
    
    const newParticipants = participants.filter((_, i) => i !== index)
    updateParticipants(newParticipants)
  }, [participants, updateParticipants])

  const reorderParticipantsAction = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || fromIndex >= participants.length) return
    if (toIndex < 0 || toIndex >= participants.length) return
    
    const newParticipants = reorderParticipants(participants, fromIndex, toIndex)
    updateParticipants(newParticipants)
  }, [participants, updateParticipants])

  // ========== Работа с предложениями ==========
  
  const searchParticipantSuggestions = useCallback((query: string, limit: number = 10) => {
    return searchParticipants(suggestionsForSearch, query, { limit })
  }, [suggestionsForSearch])

  const selectParticipant = useCallback((participant: ParticipantSuggestion) => {
    setSelectedParticipant(participant)
  }, [])

  const createParticipant = useCallback((participant: ParticipantSuggestion) => {
    // Добавляем как основного исполнителя с долей 0 (пользователь настроит)
    const artistCredit = participantSuggestionToArtistCredit(participant, 'MainArtist', 0)
    addParticipant(artistCredit)
    setIsCreateModalOpen(false)
  }, [addParticipant])

  const editParticipant = useCallback((index: number, participantRow: ParticipantRow) => {
    // Открываем модальное окно для редактирования
    const participant = participantRows[index]
    if (participant) {
      const suggestion: ParticipantSuggestion = {
        id: participant.id,
        displayName: participant.displayName,
        roles: [participant.role],
        platformLinks: []
      }
      setSelectedParticipant(suggestion)
      setIsCreateModalOpen(true)
    }
  }, [participantRows])

  // ========== Управление ошибками ==========
  
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  // ========== Various Artists ==========
  
  const toggleVariousArtists = useCallback(() => {
    setIsVariousArtistsEnabled(prev => !prev)
  }, [])

  // ========== Модальные окна ==========
  
  const openCreateModal = useCallback((initialDisplayName?: string) => {
    if (initialDisplayName) {
      setSelectedParticipant({
        id: generateParticipantId(),
        displayName: initialDisplayName,
        roles: ['MainArtist']
      })
    } else {
      setSelectedParticipant(null)
    }
    setIsCreateModalOpen(true)
  }, [])

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false)
    setSelectedParticipant(null)
  }, [])

  // ========== Вспомогательные функции ==========
  
  const getParticipantByIndex = useCallback((index: number): ArtistCredit | null => {
    return participants[index] || null
  }, [participants])

  const findParticipantByName = useCallback((displayName: string): ArtistCredit | null => {
    return participants.find(p => p.displayName === displayName) || null
  }, [participants])

  const hasParticipantWithRole = useCallback((role: string): boolean => {
    return participants.some(p => p.role === role)
  }, [participants])

  // ========== Состояние и действия для экспорта ==========
  
  const state: ParticipantManagerState = useMemo(() => ({
    participants,
    suggestions: suggestionsForSearch,
    isVariousArtistsEnabled,
    errors,
    selectedParticipant,
    isCreateModalOpen
  }), [participants, suggestionsForSearch, isVariousArtistsEnabled, errors, selectedParticipant, isCreateModalOpen])

  const actions: ParticipantManagerActions = useMemo(() => ({
    addParticipant,
    updateParticipant,
    removeParticipant,
    reorderParticipants: reorderParticipantsAction,
    selectParticipant,
    createParticipant,
    editParticipant,
    toggleVariousArtists,
    clearErrors,
    setError
  }), [
    addParticipant,
    updateParticipant,
    removeParticipant,
    reorderParticipantsAction,
    selectParticipant,
    createParticipant,
    editParticipant,
    toggleVariousArtists,
    clearErrors,
    setError
  ])

  // ========== Возвращаемое значение ==========
  
  return {
    // Состояние
    participants,
    participantRows,
    suggestions: suggestionsForSearch,
    isVariousArtistsEnabled,
    errors,
    selectedParticipant,
    isCreateModalOpen,
    
    // Вычисляемые значения
    validation,
    stats,
    
    // Состояние и действия в структурированном виде
    state,
    actions,
    
    // Основные действия
    addParticipant,
    updateParticipant,
    removeParticipant,
    reorderParticipants: reorderParticipantsAction,
    updateParticipants,
    
    // Поиск и выбор
    searchParticipants: searchParticipantSuggestions,
    selectParticipant,
    createParticipant,
    editParticipant,
    
    // Модальные окна
    openCreateModal,
    closeCreateModal,
    
    // Various Artists
    toggleVariousArtists,
    
    // Ошибки
    clearErrors,
    setError,
    
    // Утилиты
    getParticipantByIndex,
    findParticipantByName,
    hasParticipantWithRole,
    
    // Статус
    isValid: validation.isValid,
    hasParticipants: participants.length > 0,
    participantCount: participants.length,
    hasErrors: Object.keys(errors).length > 0
  }
}