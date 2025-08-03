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

// Context interface разделяем на данные и действия
interface ParticipantDataContextType {
  participants: ArtistCredit[]
  participantsCount: number
  mainArtists: ArtistCredit[]
}

interface ParticipantActionsContextType {
  setParticipants: (participants: ArtistCredit[]) => void
  updateParticipant: (index: number, participant: ArtistCredit) => void
  addParticipant: (participant: ArtistCredit) => void
  removeParticipant: (index: number) => void
  moveParticipant: (fromIndex: number, toIndex: number) => void
  resetParticipants: () => void
}

// Create separate contexts to minimize re-renders
const ParticipantDataContext = createContext<ParticipantDataContextType | undefined>(undefined)
const ParticipantActionsContext = createContext<ParticipantActionsContextType | undefined>(undefined)

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

  // Helper functions - мемоизируем для предотвращения перерендеров
  const setParticipants = React.useCallback((participants: ArtistCredit[]) => {
    dispatch({ type: 'SET_PARTICIPANTS', payload: participants })
  }, [])

  const updateParticipant = React.useCallback((index: number, participant: ArtistCredit) => {
    dispatch({ type: 'UPDATE_PARTICIPANT', payload: { index, participant } })
  }, [])

  const addParticipant = React.useCallback((participant: ArtistCredit) => {
    dispatch({ type: 'ADD_PARTICIPANT', payload: participant })
  }, [])

  const removeParticipant = React.useCallback((index: number) => {
    dispatch({ type: 'REMOVE_PARTICIPANT', payload: index })
  }, [])

  const moveParticipant = React.useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'MOVE_PARTICIPANT', payload: { fromIndex, toIndex } })
  }, [])

  const resetParticipants = React.useCallback(() => {
    dispatch({ type: 'RESET_PARTICIPANTS' })
  }, [])

  // Computed values - мемоизируем для предотвращения перерендеров
  const participantsCount = React.useMemo(() => state.participants.length, [state.participants.length])
  const mainArtists = React.useMemo(() => 
    state.participants.filter((p: ArtistCredit) => p.role === 'MainArtist'), 
    [state.participants]
  )

  // Мемоизируем данные и действия отдельно
  const dataValue: ParticipantDataContextType = React.useMemo(() => ({
    participants: state.participants,
    participantsCount,
    mainArtists
  }), [state.participants, participantsCount, mainArtists])

  const actionsValue: ParticipantActionsContextType = React.useMemo(() => ({
    setParticipants,
    updateParticipant,
    addParticipant,
    removeParticipant,
    moveParticipant,
    resetParticipants
  }), [setParticipants, updateParticipant, addParticipant, removeParticipant, moveParticipant, resetParticipants])

  return (
    <ParticipantDataContext.Provider value={dataValue}>
      <ParticipantActionsContext.Provider value={actionsValue}>
        {children}
      </ParticipantActionsContext.Provider>
    </ParticipantDataContext.Provider>
  )
}

// Hooks for data (минимальные перерендеры)
function useParticipantData() {
  const context = useContext(ParticipantDataContext)
  if (context === undefined) {
    throw new Error('useParticipantData must be used within a ParticipantProvider')
  }
  return context
}

function useParticipantActions() {
  const context = useContext(ParticipantActionsContext)
  if (context === undefined) {
    throw new Error('useParticipantActions must be used within a ParticipantProvider')
  }
  return context
}

// Individual selector hooks - теперь используют разделенные контексты
export const useParticipants = () => {
  const { participants } = useParticipantData()
  return participants
}

export const useParticipantsCount = () => {
  const { participantsCount } = useParticipantData()
  return participantsCount
}

export const useMainArtists = () => {
  const { mainArtists } = useParticipantData()
  return mainArtists
}

export const useSetParticipants = () => {
  const { setParticipants } = useParticipantActions()
  return setParticipants
}

export const useUpdateParticipant = () => {
  const { updateParticipant } = useParticipantActions()
  return updateParticipant
}

export const useAddParticipant = () => {
  const { addParticipant } = useParticipantActions()
  return addParticipant
}

export const useRemoveParticipant = () => {
  const { removeParticipant } = useParticipantActions()
  return removeParticipant
}

export const useMoveParticipant = () => {
  const { moveParticipant } = useParticipantActions()
  return moveParticipant
}

export const useResetParticipants = () => {
  const { resetParticipants } = useParticipantActions()
  return resetParticipants
}

// Backward compatibility hook
export const useParticipantContext = () => {
  const data = useParticipantData()
  const actions = useParticipantActions()
  return { ...data, ...actions }
}