import { cn } from '@/lib/utils'
import { IconProps, iconSizes } from './types'

export function DeezerIcon({ 
  size = 'md', 
  className, 
  title = "Deezer", 
  'aria-label': ariaLabel = "Deezer" 
}: IconProps) {
  const sizeClass = typeof size === 'number' 
    ? `w-${size} h-${size}` 
    : iconSizes[size]

  return (
    <svg 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn(sizeClass, 'fill-[#FF5500]', className)}
      aria-label={ariaLabel}
    >
      <path d="M18.81 12.74h3.03v2.52h-3.03v-2.52zm0-3.74h3.03v2.52h-3.03v-2.52zm0-3.74h3.03v2.52h-3.03V5.26zM15.78 12.74h3.03v2.52h-3.03v-2.52zm0-3.74h3.03v2.52h-3.03v-2.52zm0 7.48h3.03v2.52h-3.03v-2.52zM12.75 12.74h3.03v2.52h-3.03v-2.52zm0-3.74h3.03v2.52h-3.03v-2.52zm0 7.48h3.03v2.52h-3.03v-2.52zM9.72 12.74h3.03v2.52H9.72v-2.52zm0 7.48h3.03v2.52H9.72v-2.52zm0-3.74h3.03v2.52H9.72v-2.52zm-3.03-7.48h3.03v2.52H6.69v-2.52zm0 3.74h3.03v2.52H6.69v-2.52zm0 3.74h3.03v2.52H6.69v-2.52zm-3.03 0h3.03v2.52H3.66v-2.52zm0 3.74h3.03v2.52H3.66v-2.52zm-3.03 0h3.03v2.52H.63v-2.52z"/>
    </svg>
  )
}