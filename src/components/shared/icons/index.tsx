export { ZvookIcon } from './ZvookIcon'
export { SpotifyIcon } from './SpotifyIcon'
export { YandexMusicIcon } from './YandexMusicIcon'
export { AppleIcon } from './AppleIcon'
export { VKIcon } from './VKIcon'
export { YouTubeMusicIcon } from './YouTubeMusicIcon'
export { DeezerIcon } from './DeezerIcon'
export { BandLinkIcon } from './BandLinkIcon'
export { OtherIcon } from './OtherIcon'
export type { IconProps } from './types'

import { ZvookIcon } from './ZvookIcon'
import { SpotifyIcon } from './SpotifyIcon'
import { YandexMusicIcon } from './YandexMusicIcon'
import { AppleIcon } from './AppleIcon'
import { VKIcon } from './VKIcon'
import { YouTubeMusicIcon } from './YouTubeMusicIcon'
import { DeezerIcon } from './DeezerIcon'
import { BandLinkIcon } from './BandLinkIcon'
import { OtherIcon } from './OtherIcon'
import type { IconProps } from './types'

// Определяем типы платформ локально, чтобы избежать циклических зависимостей
type PlatformType = 'zvook' | 'spotify' | 'yandex' | 'appleMusic' | 'vk' | 'youtubeMusic' | 'deezer' | 'bandLink' | 'other'

// Маппинг платформ к иконкам
export const platformIcons: Record<PlatformType, React.ComponentType<IconProps>> = {
  zvook: ZvookIcon,
  spotify: SpotifyIcon,
  yandex: YandexMusicIcon,
  appleMusic: AppleIcon, // Используем иконку Apple
  vk: VKIcon,
  youtubeMusic: YouTubeMusicIcon,
  deezer: DeezerIcon,
  bandLink: BandLinkIcon,
  other: OtherIcon,
}

// Хук для получения иконки платформы
export function usePlatformIcon(platform: PlatformType) {
  return platformIcons[platform] || OtherIcon
}