// Типы для Release Validation Dashboard Widget

export interface ValidationRequirement {
  id: string
  title: string
  items: Array<{
    name: string
    completed: boolean
  }>
}

export interface ValidationModalProps {
  isOpen: boolean
  onClose: () => void
  requirements: ValidationRequirement[]
  completionPercentage: number
  completedItems: number
  totalItems: number
}

export interface ValidationState {
  requirements: ValidationRequirement[]
  completionPercentage: number
  completedItems: number
  totalItems: number
  isOpen: boolean
}