'use client'

import { useReleaseFormContext } from '@/contexts/release-form-context'
import { AnimatedInput } from '@/components/ui/animated-input'
import { DatesIdentificationSection } from '@/components/release-form/sections/dates-identification-section'

export default function SettingsPage() {
  const {
    formData,
    errors,
    handleInputChange
  } = useReleaseFormContext()

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12">
            {/* Секция: Даты и идентификация */}
            <DatesIdentificationSection
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />

            {/* Секция: Настройки релиза */}
            <div className="professional-card p-10">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                  Настройки релиза
                </h2>
              </div>

              <div className="space-y-6">
                <AnimatedInput
                  label="Лейбл / Издатель"
                  value={formData.label}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  placeholder="Введите название лейбла"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Заметки и комментарии
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full min-h-[120px] px-3 py-2 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all duration-200"
                    placeholder="Дополнительная информация о релизе, особые требования или комментарии..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}