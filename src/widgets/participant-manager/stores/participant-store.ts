import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ArtistCredit } from '@/types/ddex-release'

interface ParticipantState {
  participants: ArtistCredit[]
  
  // Действия
  setParticipants: (participants: ArtistCredit[]) => void
  updateParticipant: (index: number, field: string, value: unknown) => void
  addParticipant: (participant: ArtistCredit) => void
  removeParticipant: (index: number) => void
  moveParticipant: (fromIndex: number, toIndex: number) => void
  resetParticipants: () => void
}

export const useParticipantStore = create<ParticipantState>()(
  devtools(
    persist(
      (set) => ({
        participants: [],

        setParticipants: (participants) => 
          set({ participants }, false, 'setParticipants'),

        updateParticipant: (index, field, value) => 
          set((state) => {
            const newParticipants = [...state.participants]
            if (newParticipants[index]) {
              newParticipants[index] = { ...newParticipants[index], [field]: value }
            }
            return { participants: newParticipants }
          }, false, `updateParticipant-${index}-${field}`),

        addParticipant: (participant) => 
          set((state) => ({
            participants: [...state.participants, {
              ...participant,
              id: participant.id || crypto.randomUUID(),
              sequence: state.participants.length + 1
            }]
          }), false, 'addParticipant'),

        removeParticipant: (index) => 
          set((state) => ({
            participants: state.participants.filter((_, i) => i !== index)
          }), false, 'removeParticipant'),

        moveParticipant: (fromIndex, toIndex) => 
          set((state) => {
            if (fromIndex < 0 || fromIndex >= state.participants.length) return state
            if (toIndex < 0 || toIndex >= state.participants.length) return state
            if (fromIndex === toIndex) return state

            const newParticipants = [...state.participants]
            const [item] = newParticipants.splice(fromIndex, 1)
            newParticipants.splice(toIndex, 0, item)
            
            return { participants: newParticipants }
          }, false, 'moveParticipant'),

        resetParticipants: () => 
          set({ participants: [] }, false, 'resetParticipants'),
      }),
      {
        name: 'participant-store',
        version: 1,
        migrate: (persistedState: any) => {
          // Простая миграция - возвращаем состояние как есть
          // В будущем здесь можно добавить логику преобразования для новых версий
          return persistedState
        },
        // SSR-safe storage для Next.js (официальное решение)
        storage: {
          getItem: (name: string) => {
            // Проверяем что мы на клиенте
            if (typeof window === 'undefined') return null
            try {
              const item = localStorage.getItem(name)
              return item ? JSON.parse(item) : null
            } catch {
              return null
            }
          },
          setItem: (name: string, value: any) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.setItem(name, JSON.stringify(value))
            } catch {
              // Ignore storage errors
            }
          },
          removeItem: (name: string) => {
            if (typeof window === 'undefined') return
            try {
              localStorage.removeItem(name)
            } catch {
              // Ignore storage errors
            }
          }
        }
      }
    ),
    { name: 'ParticipantStore' }
  )
)

// Селекторы для оптимизации ререндеров
export const useParticipants = () => useParticipantStore(state => state.participants)
export const useParticipantsCount = () => useParticipantStore(state => state.participants.length)
export const useMainArtists = () => useParticipantStore(state => 
  state.participants.filter(p => p.role === 'MainArtist')
)

// Отдельные селекторы для стабильных функций (исправляет SSR проблемы)
export const useSetParticipants = () => useParticipantStore(state => state.setParticipants)
export const useUpdateParticipant = () => useParticipantStore(state => state.updateParticipant)
export const useAddParticipant = () => useParticipantStore(state => state.addParticipant)
export const useRemoveParticipant = () => useParticipantStore(state => state.removeParticipant)
export const useMoveParticipant = () => useParticipantStore(state => state.moveParticipant)
export const useResetParticipants = () => useParticipantStore(state => state.resetParticipants)