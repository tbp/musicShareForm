'use client'

import { useCallback } from 'react'
import { Settings } from 'lucide-react'
import { ReleaseValidationDashboard } from '@/widgets/release-validation-dashboard'
import { AnimatedInput } from '@/components/ui/animated-input'

import { TrackCollectionManager } from '@/widgets/track-collection-manager'


import { ReleaseFormProvider, useReleaseFormContext } from '@/contexts/release-form-context'
import EnhancedReleaseFormNavigation from '@/components/release-form/enhanced-release-form-navigation'
import { BasicInfoSection } from '@/components/release-form/sections/basic-info-section'
import { ReleaseTypeSection } from '@/components/release-form/sections/release-type-section'
import { DatesIdentificationSection } from '@/components/release-form/sections/dates-identification-section'
import { ParticipantManager } from '@/widgets/participant-manager'
import { Footer } from '@/components/ui/footer'

function ReleaseFormContent() {
  const {
    // Состояние
    activeTab,
    validationOpen,
    setValidationOpen,
    formData,
    coverArt,
    setCoverArt,
    audioFiles,
    setAudioFiles,
    errors,
    validationProgress,

    // Обработчики
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
    <div className="min-h-screen bg-background flex flex-col">
      <EnhancedReleaseFormNavigation />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">

          {/* Контент вкладок */}
          {activeTab === 'basic' && (
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

              {/* Секция: Даты и идентификация */}
              <DatesIdentificationSection
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

              {/* Секция: Дополнительная информация */}
              <div className="professional-card p-10">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Дополнительная информация
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Лейбл, заметки и другие дополнительные данные
                  </p>
                </div>

                <div className="space-y-6">
                  <AnimatedInput
                    label="Название лейбла"
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    hint="Звукозаписывающий лейбл или саб-лейбл (часто заполняется автоматически)"
                  />

                <AnimatedInput
                    label="Заметки"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  hint="Дополнительные комментарии или примечания к релизу"
                />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tracks' && (
            <div className="professional-card p-10">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Аудио файлы
                </h2>
              </div>

              <TrackCollectionManager
                label="Треки релиза"
                accept="audio/*"
                multiple={true}
                maxFiles={50}
                maxSizeMB={100}
                value={audioFiles}
                onFilesChange={setAudioFiles}
                hint="Загрузите аудио файлы в форматах WAV, FLAC, MP3 (до 100МБ каждый)"
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="professional-card p-10">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Настройки релиза
                </h2>
              </div>
              
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Дополнительные настройки будут добавлены в следующих версиях
                </p>
              </div>
            </div>
          )}



          {/* Модал валидации */}
          <ReleaseValidationDashboard
            isOpen={validationOpen}
            onClose={() => setValidationOpen(false)}
            requirements={[]}
            completionPercentage={validationProgress}
            completedItems={0}
            totalItems={0}
          />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export function ReleaseFormScreen() {
  return (
    <ReleaseFormProvider>
      <ReleaseFormContent />
    </ReleaseFormProvider>
  )
} 