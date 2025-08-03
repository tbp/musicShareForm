import { AnimatedInput } from '@/components/ui/animated-input'
import { ArtworkManager } from '@/widgets/artwork-manager'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { ParentalAdvisorySelect } from '@/components/ui/parental-advisory-select'
import { YearCombobox } from '@/components/ui/year-combobox'
import type { FileItem } from '@/widgets/artwork-manager'
import { ReleaseFormData } from '@/types/ddex-release'
import { GENRES, SUBGENRES } from '@/data/genres'
import { PARENTAL_ADVISORY_OPTIONS } from '@/constants/release-form'

interface BasicInfoSectionProps {
  formData: ReleaseFormData
  coverArt: FileItem[]
  errors: Record<string, string>
  onInputChange: (field: keyof ReleaseFormData, value: string | number | boolean) => void
  onCoverArtChange: (files: FileItem[]) => void
}

export function BasicInfoSection({
  formData,
  coverArt,
  errors,
  onInputChange,
  onCoverArtChange
}: BasicInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[38%_1fr] gap-8">
      {/* Левая колонка - Обложка */}
      <div className="space-y-6">
        <ArtworkManager
          value={coverArt}
          onFilesChange={onCoverArtChange}
          error={errors.coverArt}
          maxSizeMB={30}
        />
      </div>

      {/* Правая колонка - Основная информация */}
      <div className="space-y-6">
        <div className="space-y-4">
          <AnimatedInput
            label="Название релиза"
            value={formData.title}
            onChange={(e) => onInputChange('title', e.target.value)}
            required
            error={errors.title}
          />

          <AnimatedInput
            label="Подназвание / Версия"
            value={formData.subtitle}
            onChange={(e) => onInputChange('subtitle', e.target.value)}
            placeholder="Опционально"
          />

          <YearCombobox
            label="Год записи"
            value={formData.recordingYear}
            onChange={(value: string) => onInputChange('recordingYear', value)}
            placeholder="Введите год"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SearchableSelect
            label="Жанр"
            options={GENRES}
            value={formData.genre}
            onValueChange={(value) => {
              onInputChange('genre', value)
              onInputChange('subGenre', '') // Сброс поджанра
            }}
            placeholder="Выберите жанр"
            searchPlaceholder="Поиск жанра..."
            emptyMessage="Жанр не найден"
          />

          <SearchableSelect
            label="Поджанр"
            options={formData.genre && SUBGENRES[formData.genre as keyof typeof SUBGENRES] || []}
            value={formData.subGenre || ''}
            onValueChange={(value) => onInputChange('subGenre', value)}
            disabled={!formData.genre}
            placeholder={formData.genre ? "Выберите поджанр" : "Сначала выберите жанр"}
            searchPlaceholder="Поиск поджанра..."
            emptyMessage="Поджанр не найден"
          />
        </div>

        <ParentalAdvisorySelect
          label="Ненормативная лексика"
          options={PARENTAL_ADVISORY_OPTIONS}
          value={formData.parentalAdvisory}
          onValueChange={(value) => onInputChange('parentalAdvisory', value)}
          placeholder="Выберите тип контента"
        />
      </div>
    </div>
  )
} 