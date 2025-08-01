// Participant Manager Widget
// Управление участниками релиза

export { ParticipantsSection as ParticipantManager } from './components/ParticipantsSection'
export { ParticipantAutocomplete } from './components/ParticipantAutocomplete'
export { CreateParticipantModal } from './components/CreateParticipantModal'
export { ArtistPlatformsPopover } from './components/ArtistPlatformsPopover'
export { ParticipantsDataTable as ParticipantsTable } from './components/ParticipantsTable/data-table'
export { createColumns } from './components/ParticipantsTable/columns'
export { useParticipantManager } from './hooks/useParticipantManager'
export { 
  validateParticipant,
  validateParticipantsList,
  getParticipantStats,
  searchParticipants,
  reorderParticipants,
  participantSuggestionToArtistCredit
} from './utils/participantUtils'
export type * from './types/participant.types'
export { PARTICIPANT_ROLES } from './constants/participantRoles'
export { DEMO_PARTICIPANTS, searchParticipantsBasic } from './data/demoParticipants'