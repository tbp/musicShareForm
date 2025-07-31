export interface IconProps {
  size?: 'sm' | 'md' | 'lg' | number
  className?: string
  title?: string
  'aria-label'?: string
}

export const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4', 
  lg: 'w-6 h-6'
} as const