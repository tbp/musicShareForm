// Типы для Participant Manager Widget

import type { LucideIcon } from 'lucide-react'

// ========== Базовые типы платформ и ролей ==========

export type PlatformType = 
  | 'spotify' 
  | 'yandex' 
  | 'vk' 
  | 'zvook' 
  | 'appleMusic' 
  | 'youtubeMusic' 
  | 'deezer' 
  | 'bandLink'
  | 'other'

export interface PlatformLink {
  platform: PlatformType
  url: string
  verified?: boolean
}

export type ParticipantRole = 
  | 'MainArtist' 
  | 'FeaturedArtist' 
  | 'Remixer' 
  | 'Producer' 
  | 'Vocalist' 
  | 'Songwriter' 
  | 'Composer' 
  | 'Arranger' 
  | 'MixEngineer' 
  | 'MasteringEngineer'

export interface ParticipantRoleInfo {
  displayName: string
  icon: LucideIcon
}

// ========== Участники и предложения ==========

export interface ParticipantSuggestion {
  id: string
  displayName: string
  realName?: string
  roles: string[]
  description?: string
  isni?: string // International Standard Name Identifier
  ipi?: string // Interested Parties Information
  platformLinks?: PlatformLink[]
}

export interface ArtistCredit {
  id?: string // Уникальный ID для UI (опциональный для обратной совместимости)
  displayName: string
  role: ParticipantRole
  share: number // Доля в процентах
  sequence?: number
  copyrightShare?: number // Доля в авторских правах (до 100%)
  relatedRightsShare?: number // Доля в смежных правах (до 100%)
}

export type ParticipantRow = ArtistCredit & {
  id: string
}

// ========== Компоненты пропсы ==========

export interface ParticipantAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectParticipant?: (participant: ParticipantSuggestion) => void
  onEditParticipant?: (participant: ParticipantSuggestion | { displayName: string; [key: string]: any }) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  icon?: React.ComponentType<any>
  showValidationError?: boolean
}

export interface CreateParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateParticipant: (participant: ParticipantSuggestion) => void
  initialDisplayName?: string
  initialData?: any
  mode?: 'create' | 'edit'
}

export interface ArtistPlatformsPopoverProps {
  participant: ParticipantSuggestion
  children: React.ReactNode
  onEdit?: () => void
}

export interface ParticipantsSectionProps {
  participants: ArtistCredit[]
  onParticipantsChange: (participants: ArtistCredit[] | ((prev: ArtistCredit[]) => ArtistCredit[])) => void
  errors: Record<string, string>
  onInputChange: (field: string, value: any) => void
  onUpdateArtist: (index: number, field: string, value: any) => void
}

export interface ParticipantsTableProps {
  participants: ParticipantRow[]
  onParticipantsChange: (participants: ParticipantRow[]) => void
  onEditParticipant?: (index: number, participant: ParticipantRow) => void
  onDeleteParticipant?: (index: number) => void
  className?: string
}

// ========== Хуки и состояние ==========

export interface ParticipantManagerState {
  participants: ArtistCredit[]
  suggestions: ParticipantSuggestion[]
  isVariousArtistsEnabled: boolean
  errors: Record<string, string>
  selectedParticipant: ParticipantSuggestion | null
  isCreateModalOpen: boolean
}

export interface ParticipantManagerActions {
  addParticipant: (participant: ArtistCredit) => void
  updateParticipant: (index: number, field: string, value: any) => void
  removeParticipant: (index: number) => void
  reorderParticipants: (fromIndex: number, toIndex: number) => void
  selectParticipant: (participant: ParticipantSuggestion) => void
  createParticipant: (participant: ParticipantSuggestion) => void
  editParticipant: (index: number, participant: ParticipantRow) => void
  toggleVariousArtists: () => void
  clearErrors: () => void
  setError: (field: string, error: string) => void
}

// ========== Утилиты и валидация ==========

export interface ParticipantValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings?: string[]
}

export interface ParticipantSearchResult {
  suggestions: ParticipantSuggestion[]
  hasMore: boolean
  total: number
}

export interface ParticipantStats {
  total: number
  byRole: Record<ParticipantRole, number>
  totalCopyrightShare: number
  totalRelatedRightsShare: number
  isComplete: boolean
}

// ========== Экспорт для использования в других частях приложения ==========

export type {
  // Для обратной совместимости
  ParticipantSuggestion as Participant,
  ArtistCredit as Artist,
  ParticipantRow as TableParticipant
}