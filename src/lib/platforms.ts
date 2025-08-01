import { PlatformType } from '@/widgets/participant-manager'

export interface PlatformInfo {
  id: PlatformType
  name: string
  icon: string
  color: string
  domain: string
}

export const PLATFORMS: Record<PlatformType, PlatformInfo> = {
  spotify: {
    id: 'spotify',
    name: 'Spotify',
    icon: '/spotify.svg',
    color: '#1DB954',
    domain: 'open.spotify.com'
  },
  yandex: {
    id: 'yandex',
    name: 'Яндекс Музыка',
    icon: '/yandex-icon.svg',
    color: '#FFBC0D',
    domain: 'music.yandex.ru'
  },
  vk: {
    id: 'vk',
    name: 'VK Музыка',
    icon: '/vk.svg',
    color: '#0077FF',
    domain: 'vk.com'
  },
  zvook: {
    id: 'zvook',
    name: 'Звук',
    icon: '/zvook.svg',
    color: '#000000',
    domain: 'zvook.com'
  },
  appleMusic: {
    id: 'appleMusic',
    name: 'Apple Music',
    icon: '/apple-music.svg',
    color: '#FA243C',
    domain: 'music.apple.com'
  },
  youtubeMusic: {
    id: 'youtubeMusic',
    name: 'YouTube Music',
    icon: '/youtube-music.svg',
    color: '#FF0000',
    domain: 'music.youtube.com'
  },
  deezer: {
    id: 'deezer',
    name: 'Deezer',
    icon: '/deezer.svg',
    color: '#FF6600',
    domain: 'deezer.com'
  },
  bandLink: {
    id: 'bandLink',
    name: 'BandLink',
    icon: '/bandlink.svg',
    color: '#6B46C1',
    domain: 'band.link'
  },
  other: {
    id: 'other',
    name: 'Другая',
    icon: '/globe.svg',
    color: '#6B7280',
    domain: ''
  }
}

export function getPlatformInfo(platformId: PlatformType): PlatformInfo {
  return PLATFORMS[platformId]
}

export function isPlatformVerified(url: string, platform: PlatformType): boolean {
  if (platform === 'other') return true // Для "другой" платформы всегда валидно
  const platformInfo = getPlatformInfo(platform)
  return url.includes(platformInfo.domain)
}