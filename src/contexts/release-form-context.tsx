'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useReleaseForm } from '@/hooks/use-release-form'

type ReleaseFormContextType = ReturnType<typeof useReleaseForm>

const ReleaseFormContext = createContext<ReleaseFormContextType | undefined>(undefined)

export function ReleaseFormProvider({ children }: { children: ReactNode }) {
  const releaseFormState = useReleaseForm()
  
  return (
    <ReleaseFormContext.Provider value={releaseFormState}>
      {children}
    </ReleaseFormContext.Provider>
  )
}

export function useReleaseFormContext() {
  const context = useContext(ReleaseFormContext)
  if (context === undefined) {
    throw new Error('useReleaseFormContext must be used within a ReleaseFormProvider')
  }
  return context
}