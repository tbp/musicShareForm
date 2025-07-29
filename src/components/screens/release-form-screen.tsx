'use client'

import { Save, Play, Disc, Library, FolderOpen, User, Settings, AlertCircle } from 'lucide-react'
import { ValidationModal } from '@/components/features/validation-modal'
import { AnimatedInput } from '@/components/ui/animated-input'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { EnhancedFileUpload } from '@/components/ui/enhanced-file-upload'
import { DraggableArtistItem } from '@/components/ui/draggable-artist-item'
import { RadioCard, RadioCardGroup } from '@/components/ui/radio-card'
import { UPCInput } from '@/components/ui/upc-input'

import { useReleaseForm } from '@/hooks/use-release-form'
import { ReleaseFormHeader } from '@/components/release-form/release-form-header'
import { ReleaseFormNavigation } from '@/components/release-form/release-form-navigation'
import { BasicInfoSection } from '@/components/release-form/sections/basic-info-section'

export function ReleaseFormScreen() {
  const {
    // Состояние
    activeTab,
    setActiveTab,
    validationOpen,
    setValidationOpen,
    isSubmitting,
    draggedIndex,
    formData,
    coverArt,
    setCoverArt,
    audioFiles,
    setAudioFiles,
    errors,
    validationProgress,

    // Обработчики
    handleInputChange,
    updateArtist,
    addArtist,
    removeArtist,
    moveArtist,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleSubmit
  } = useReleaseForm()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <ReleaseFormHeader />
          
          <ReleaseFormNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            validationProgress={validationProgress}
            onValidationClick={() => setValidationOpen(true)}
          />

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

              {/* Секция: Тип релиза */}
              <div className="professional-card p-10">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Тип релиза
                  </h2>
                </div>
                
                <RadioCardGroup
                  value={formData.releaseType}
                  onValueChange={(value) => handleInputChange('releaseType', value)}
                >
                  <RadioCard
                    value="Single"
                    title="Сингл"
                    description="1-3 трека"
                    icon={<Play className="w-4 h-4" />}
                  />
                  <RadioCard
                    value="EP"
                    title="EP"
                    description="4-7 треков"
                    icon={<Library className="w-4 h-4" />}
                  />
                  <RadioCard
                    value="Album"
                    title="Альбом"
                    description="8+ треков"
                    icon={<Disc className="w-4 h-4" />}
                  />
                  <RadioCard
                    value="Compilation"
                    title="Сборник"
                    description="Готовые треки"
                    icon={<FolderOpen className="w-4 h-4" />}
                  />
                </RadioCardGroup>
              </div>

              {/* Секция 3: Управление датами и идентификацией */}
              <div className="professional-card p-10">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground">
                    Управление датами и идентификацией
                  </h2>
                </div>

                <div className="space-y-8">
                  {/* Строка с датами */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Левая часть - Дата цифрового релиза */}
                  <AnimatedInput
                      label="Дата цифрового релиза"
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => {
                        handleInputChange('releaseDate', e.target.value)
                        // Синхронизируем с оригинальной датой если она не отличается
                        if (!formData.originalReleaseDate || formData.originalReleaseDate === formData.releaseDate) {
                          handleInputChange('originalReleaseDate', e.target.value)
                        }
                      }}
                      required
                    />
                    
                    {/* Правая часть - Опция оригинальной даты или кнопка */}
                    {formData.originalReleaseDate && formData.originalReleaseDate !== formData.releaseDate ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Отдельная дата оригинального релиза</span>
                          <button
                            type="button"
                            onClick={() => handleInputChange('originalReleaseDate', formData.releaseDate || '')}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Убрать
                          </button>
                        </div>
                  <AnimatedInput
                          label="Дата оригинального релиза"
                    type="date"
                    value={formData.originalReleaseDate}
                    onChange={(e) => handleInputChange('originalReleaseDate', e.target.value)}
                  />
                </div>
                    ) : (
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleInputChange('originalReleaseDate', formData.releaseDate || '')}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:bg-accent/30 h-fit"
                        >
                          <span>+</span>
                          <span>Отдельная дата оригинального релиза</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Третья строка: UPC код */}
                  <div className="w-full">
                    <UPCInput
                      label="UPC / ICPN / EAN код"
                      value={formData.upc}
                      onChange={(value) => handleInputChange('upc', value)}
                      hint="Будет присвоен автоматически, если не указать"
                      placeholder="Оставьте пустым для автоматического присвоения"
                    />
                  </div>
                </div>
              </div>

              {/* Секция 4: Участники */}
              <div className="professional-card p-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Участники произведения
                  </h2>
                  <EnhancedButton
                    onClick={addArtist}
                    variant="outline"
                    size="sm"
                    leftIcon={<User className="w-4 h-4" />}
                  >
                    Добавить исполнителя
                  </EnhancedButton>
                </div>

                <div className="space-y-4">
                  {formData.artists.map((artist, index) => (
                    <DraggableArtistItem
                      key={index}
                      artist={artist}
                      index={index}
                      isFirst={index === 0}
                      isLast={index === formData.artists.length - 1}
                      onUpdate={updateArtist}
                      onRemove={removeArtist}
                      onMove={moveArtist}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      isDragging={draggedIndex === index}
                      draggedIndex={draggedIndex}
                    />
                  ))}
                </div>

                {errors.artists && (
                  <div className="validation-hint mt-4">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {errors.artists}
                  </div>
                )}
              </div>

              {/* Секция 5: Дополнительная информация */}
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

              <EnhancedFileUpload
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

          {/* Кнопка сохранения */}
          <div className="flex justify-center mt-8">
            <EnhancedButton
              onClick={handleSubmit}
              loading={isSubmitting}
              size="lg"
              variant="gradient"
              leftIcon={<Save className="w-5 h-5" />}
              animation="glow"
            >
              {isSubmitting ? 'Создание релиза...' : 'Создать релиз'}
            </EnhancedButton>
          </div>

          {/* Модал валидации */}
          <ValidationModal
            isOpen={validationOpen}
            onClose={() => setValidationOpen(false)}
            requirements={[]}
            completionPercentage={validationProgress}
            completedItems={0}
            totalItems={0}
          />
        </div>
      </div>
    </div>
  )
} 