'use client'

import { ReleaseFormProvider } from '@/contexts/release-form-context'
import { ParticipantProvider } from '@/widgets/participant-manager'
import ReleaseNavigation from '@/components/navigation/release-navigation'
import { Footer } from '@/components/ui/footer'
import { ReleaseValidationWrapper } from '@/components/validation/release-validation-wrapper'

interface ReleaseLayoutProps {
  children: React.ReactNode
}

export function ReleaseLayout({ children }: ReleaseLayoutProps) {
  return (
    <ReleaseFormProvider>
      <ParticipantProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <ReleaseNavigation />
          
          {children}
          
          <Footer />
          
          {/* Модальные окна и другие глобальные компоненты */}
          <ReleaseValidationWrapper />
        </div>
      </ParticipantProvider>
    </ReleaseFormProvider>
  )
}