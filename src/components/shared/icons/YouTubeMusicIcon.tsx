import { cn } from '@/lib/utils'
import { IconProps, iconSizes } from './types'

export function YouTubeMusicIcon({ 
  size = 'md', 
  className, 
  title = "YouTube Music", 
  'aria-label': ariaLabel = "YouTube Music" 
}: IconProps) {
  const sizeClass = typeof size === 'number' 
    ? `w-${size} h-${size}` 
    : iconSizes[size]

  return (
    <svg 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn(sizeClass, className)}
      aria-label={ariaLabel}
    >
      <path 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.67 2.94-1.46 4.03-.82 1.14-1.84 1.85-3.02 2.07-.5.1-.97.14-1.42.14-.45 0-.92-.04-1.42-.14-1.18-.22-2.2-.93-3.02-2.07-.79-1.09-1.31-2.45-1.46-4.03-.08-.8-.05-1.54.08-2.22.28-1.47 1.03-2.72 2.11-3.5.9-.66 1.98-1.02 3.16-1.08.54-.03 1.09.01 1.62.12.47.1.92.25 1.34.45.9.43 1.67 1.13 2.21 2.01.54.88.84 1.9.78 2.93z" 
        fill="#FF0000"
      />
      <path 
        d="m9.5 8.5l5 3.5-5 3.5z" 
        fill="#fff"
      />
    </svg>
  )
}