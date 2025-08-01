// Типы для UPC Manager Widget

export type UPCFormat = 'UPC-A' | 'EAN-13' | 'UPC-E'

export interface UPCFormatInfo {
  length: number
  pattern: string
  description: string
}

export interface UPCInputProps {
  label?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  className?: string
  onFocus?: () => void
  onBlur?: () => void
  showHelpButton?: boolean
  onHelpClick?: () => void
}

export interface UPCValidationResult {
  isValid: boolean
  format: UPCFormat | null
  isComplete: boolean
  checksum: boolean
  error?: string
}

export interface UPCState {
  value: string
  format: UPCFormat | null
  isValid: boolean
  isComplete: boolean
  errors: string[]
}