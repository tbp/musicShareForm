import { cn } from '@/lib/utils'
import { IconProps, iconSizes } from './types'

export function BandLinkIcon({ 
  size = 'md', 
  className, 
  'aria-label': ariaLabel = "BandLink" 
}: IconProps) {
  const sizeClass = typeof size === 'number' 
    ? `w-${size} h-${size}` 
    : iconSizes[size]

  return (
    <svg 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn(sizeClass, 'fill-[#1976D2]', className)}
      aria-label={ariaLabel}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <path d="M8 12h2v6H8v-6zm3-4h2v10h-2V8zm3 2h2v8h-2v-8z"/>
    </svg>
  )
}