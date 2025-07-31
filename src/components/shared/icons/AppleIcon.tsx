import { cn } from '@/lib/utils'
import { IconProps, iconSizes } from './types'

export function AppleIcon({ 
  size = 'md', 
  className, 
  title = "Apple Music", 
  'aria-label': ariaLabel = "Apple Music" 
}: IconProps) {
  const sizeClass = typeof size === 'number' 
    ? `w-${size} h-${size}` 
    : iconSizes[size]

  return (
    <svg 
      viewBox="0 0 122.88 122.88" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn(sizeClass, className)}
      aria-label={ariaLabel}
    >
      <defs>
        <path 
          id="roundedRect" 
          d="M18.43,0h86.02c10.18,0,18.43,8.25,18.43,18.43v86.02c0,10.18-8.25,18.43-18.43,18.43H18.43 C8.25,122.88,0,114.63,0,104.45l0-86.02C0,8.25,8.25,0,18.43,0L18.43,0z"
        />
      </defs>
      <clipPath id="roundedClip">
        <use href="#roundedRect" />
      </clipPath>
      <g clipPath="url(#roundedClip)">
        <rect width="122.88" height="122.88" fill="#000000" />
        <path 
          fill="#FFFFFF" 
          d="M47.76,86.16v-38.4c0-1.44,0.8-2.32,2.4-2.64l33.12-6.72c1.76-0.32,2.72,0.48,2.88,2.4v29.28 c0,2.4-3.6,4-10.8,4.8c-13.68,2.16-11.52,25.2,7.2,18.96c7.2-2.64,8.4-9.6,8.4-16.56V21.12c0,0,0-4.8-4.08-3.6l-40.8,8.4 c0,0-3.12,0.48-3.12,4.32v48.72c0,2.4-3.6,4-10.8,4.8c-13.68,2.16-11.52,25.2,7.2,18.96C46.56,100.08,47.76,93.12,47.76,86.16 L47.76,86.16z"
        />
      </g>
    </svg>
  )
}