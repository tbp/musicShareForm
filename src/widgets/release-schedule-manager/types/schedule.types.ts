// Типы для Release Schedule Manager Widget



export interface DatePreset {
  label: string
  getValue: () => Date
}

export interface EnhancedDatePickerProps {
  value?: string
  onChange: (date: string) => void
  label: string
  placeholder?: string
  error?: string
  minDate?: Date
  showPresets?: boolean
  disabled?: boolean
  required?: boolean
  additionalContent?: React.ReactNode
}

export interface DateValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
  daysUntilRelease?: number
}

export interface ReleaseDateInfo {
  releaseDate: string
  originalReleaseDate?: string
  isLinked: boolean
  validation: DateValidationResult
}

export interface ScheduleState {
  releaseDate: string
  originalReleaseDate: string
  isLinked: boolean
  errors: Record<string, string>
}

export interface ScheduleManagerProps {
  releaseDate?: string
  originalReleaseDate?: string
  onReleaseDateChange: (date: string) => void
  onOriginalReleaseDateChange: (date: string) => void
  errors?: Record<string, string>
  className?: string
}