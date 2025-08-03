'use client'

import { useReleaseFormContext } from '@/contexts/release-form-context'
import { BasicInfoSection } from '@/components/release-form/sections/basic-info-section'
import { ReleaseTypeSection } from '@/components/release-form/sections/release-type-section'
import { ParticipantManager } from '@/widgets/participant-manager'
import { useCallback } from 'react'

export default function BasicInfoPage() {
  const {
    formData,
    coverArt,
    setCoverArt,
    errors,
    handleInputChange,
    updateArtist
  } = useReleaseFormContext()

  // Обработчик изменения участников - оптимизирован для предотвращения циклов
  const handleParticipantsChange = useCallback((participants: any) => {
    if (typeof participants === 'function') {
      // Получаем актуальное состояние из formData в момент вызова
      handleInputChange('artists', (currentArtists: any) => participants(currentArtists))
    } else {
      handleInputChange('artists', participants)
    }
  }, [handleInputChange])

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12">
            <BasicInfoSection 
              formData={formData}
              coverArt={coverArt}
              errors={errors}
              onInputChange={handleInputChange}
              onCoverArtChange={setCoverArt}
            />
            <ReleaseTypeSection
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />

            {/* Секция: Участники */}
            <ParticipantManager 
              participants={formData.artists}
              onParticipantsChange={handleParticipantsChange}
              errors={errors}
              onInputChange={handleInputChange}
              onUpdateArtist={updateArtist}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
