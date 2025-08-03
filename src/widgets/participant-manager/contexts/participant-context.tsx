'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import type { ArtistCredit } from '../types/participant.types'

// State interface
interface ParticipantState {
  participants: ArtistCredit[]
}

// Action types
type ParticipantAction =
  | { type: 'SET_PARTICIPANTS'; payload: ArtistCredit[] }
  | { type: 'UPDATE_PARTICIPANT'; payload: { index: number; participant: ArtistCredit } }
  | { type: 'ADD_PARTICIPANT'; payload: ArtistCredit }
  | { type: 'REMOVE_PARTICIPANT'; payload: number }
  | { type: 'MOVE_PARTICIPANT'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'RESET_PARTICIPANTS' }

// Initial state
const initialState: ParticipantState = {
  participants: []
}

// Reducer function
function participantReducer(state: ParticipantState, action: ParticipantAction): ParticipantState {
  switch (action.type) {
    case 'SET_PARTICIPANTS':
      return { participants: action.payload }

    case 'UPDATE_PARTICIPANT': {
      const { index, participant } = action.payload
      if (index < 0 || index >= state.participants.length) return state
      
      const newParticipants = [...state.participants]
      newParticipants[index] = participant
      return { participants: newParticipants }
    }

    case 'ADD_PARTICIPANT':
      return { participants: [...state.participants, action.payload] }

    case 'REMOVE_PARTICIPANT': {
      const index = action.payload
      if (index < 0 || index >= state.participants.length) return state
      
      const newParticipants = [...state.participants]
      newParticipants.splice(index, 1)
      return { participants: newParticipants }
    }

    case 'MOVE_PARTICIPANT': {
      const { fromIndex, toIndex } = action.payload
      if (fromIndex < 0 || fromIndex >= state.participants.length) return state
      if (toIndex < 0 || toIndex >= state.participants.length) return state
      if (fromIndex === toIndex) return state

      const newParticipants = [...state.participants]
      const [item] = newParticipants.splice(fromIndex, 1)
      newParticipants.splice(toIndex, 0, item)
      return { participants: newParticipants }
    }

    case 'RESET_PARTICIPANTS':
      return { participants: [] }

    default:
      return state
  }
}

// Context interface
interface ParticipantContextType {
  state: ParticipantState
  dispatch: React.Dispatch<ParticipantAction>
  // Helper functions (equivalent to Zustand selectors)
  participants: ArtistCredit[]
  setParticipants: (participants: ArtistCredit[]) => void
  updateParticipant: (index: number, participant: ArtistCredit) => void
  addParticipant: (participant: ArtistCredit) => void
  removeParticipant: (index: number) => void
  moveParticipant: (fromIndex: number, toIndex: number) => void
  resetParticipants: () => void
  // Computed values
  participantsCount: number
  mainArtists: ArtistCredit[]
}

// Create context
const ParticipantContext = createContext<ParticipantContextType | undefined>(undefined)

// LocalStorage key
const STORAGE_KEY = 'participant-store'

// Provider component
interface ParticipantProviderProps {
  children: ReactNode
}

export function ParticipantProvider({ children }: ParticipantProviderProps) {
  // Initialize state with localStorage data
  const [state, dispatch] = useReducer(participantReducer, initialState, (initial) => {
    if (typeof window === 'undefined') return initial
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { participants: parsed.state?.participants || [] }
      }
    } catch (error) {
      console.warn('Failed to parse stored participant data:', error)
    }
    
    return initial
  })

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        state,
        version: 1
      }))
    } catch (error) {
      console.warn('Failed to save participant data:', error)
    }
  }, [state])

  // Helper functions
  const setParticipants = (participants: ArtistCredit[]) => {
    dispatch({ type: 'SET_PARTICIPANTS', payload: participants })
  }

  const updateParticipant = (index: number, participant: ArtistCredit) => {
    dispatch({ type: 'UPDATE_PARTICIPANT', payload: { index, participant } })
  }

  const addParticipant = (participant: ArtistCredit) => {
    dispatch({ type: 'ADD_PARTICIPANT', payload: participant })
  }

  const removeParticipant = (index: number) => {
    dispatch({ type: 'REMOVE_PARTICIPANT', payload: index })
  }

  const moveParticipant = (fromIndex: number, toIndex: number) => {
    dispatch({ type: 'MOVE_PARTICIPANT', payload: { fromIndex, toIndex } })
  }

  const resetParticipants = () => {
    dispatch({ type: 'RESET_PARTICIPANTS' })
  }

  // Computed values
  const participantsCount = state.participants.length
  const mainArtists = state.participants.filter((p: ArtistCredit) => p.role === 'MainArtist')

  const contextValue: ParticipantContextType = {
    state,
    dispatch,
    participants: state.participants,
    setParticipants,
    updateParticipant,
    addParticipant,
    removeParticipant,
    moveParticipant,
    resetParticipants,
    participantsCount,
    mainArtists
  }

  return (
    <ParticipantContext.Provider value={contextValue}>
      {children}
    </ParticipantContext.Provider>
  )
}

// Hook to use the context
export function useParticipantContext() {
  const context = useContext(ParticipantContext)
  if (context === undefined) {
    throw new Error('useParticipantContext must be used within a ParticipantProvider')
  }
  return context
}

// Individual selector hooks (for easier migration)
export const useParticipants = () => {
  const { participants } = useParticipantContext()
  return participants
}

export const useParticipantsCount = () => {
  const { participantsCount } = useParticipantContext()
  return participantsCount
}

export const useMainArtists = () => {
  const { mainArtists } = useParticipantContext()
  return mainArtists
}

export const useSetParticipants = () => {
  const { setParticipants } = useParticipantContext()
  return setParticipants
}

export const useUpdateParticipant = () => {
  const { updateParticipant } = useParticipantContext()
  return updateParticipant
}

export const useAddParticipant = () => {
  const { addParticipant } = useParticipantContext()
  return addParticipant
}

export const useRemoveParticipant = () => {
  const { removeParticipant } = useParticipantContext()
  return removeParticipant
}

export const useMoveParticipant = () => {
  const { moveParticipant } = useParticipantContext()
  return moveParticipant
}

export const useResetParticipants = () => {
  const { resetParticipants } = useParticipantContext()
  return resetParticipants
}