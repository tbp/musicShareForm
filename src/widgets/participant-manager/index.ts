// Participant Manager Widget
// Управление участниками релиза

export { ParticipantsSectionResponsive as ParticipantManager } from './components/ParticipantsSectionResponsive'
export { ParticipantsSectionMobile } from './components/ParticipantsSectionMobile'
export { ParticipantsSectionResponsive } from './components/ParticipantsSectionResponsive'
export { ParticipantAutocomplete } from './components/ParticipantAutocomplete'
export { CreateParticipantModal } from './components/CreateParticipantModal'
export { CreateParticipantModalMobile } from './components/CreateParticipantModalMobile'
export { CreateParticipantModalResponsive } from './components/CreateParticipantModalResponsive'
export { ArtistPlatformsPopover } from './components/ArtistPlatformsPopover'
export { ParticipantsDataTable as ParticipantsTable } from './components/ParticipantsTable/data-table'
export { createColumns } from './components/ParticipantsTable/columns'

export { 
  validateParticipant,
  searchParticipants,
  participantSuggestionToArtistCredit
} from './utils/participantUtils'
export type * from './types/participant.types'
export { PARTICIPANT_ROLES } from './constants/participantRoles'
export { DEMO_PARTICIPANTS, searchParticipantsBasic } from './data/demoParticipants'

// React Context для управления участниками
export {
  ParticipantProvider,
  useParticipantContext,
  useParticipants,
  useParticipantsCount,
  useMainArtists,
  useSetParticipants,
  useUpdateParticipant,
  useAddParticipant,
  useRemoveParticipant,
  useMoveParticipant,
  useResetParticipants
} from './contexts/participant-context'