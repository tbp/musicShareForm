// Демо-данные участников для Participant Manager Widget

import type { ParticipantSuggestion } from '../types/participant.types'

export const DEMO_PARTICIPANTS: ParticipantSuggestion[] = [
  {
    id: 'gaeor',
    displayName: 'Gaeor',
    realName: 'Георгий Акопов',
    roles: ['MainArtist', 'Producer', 'Composer'],
    description: 'Артист, продюсер и композитор',
    isni: '0000-0001-2345-6789',
    ipi: '00123456789',
    platformLinks: [
      { platform: 'spotify', url: 'https://open.spotify.com/artist/1234567890', verified: true },
      { platform: 'yandex', url: 'https://music.yandex.ru/artist/1234567', verified: true },
      { platform: 'appleMusic', url: 'https://music.apple.com/artist/gaeor/1234567890', verified: true },
      { platform: 'vk', url: 'https://vk.com/gaeor_music', verified: false }
    ]
  },
  {
    id: 'anna-volkova',
    displayName: 'Анна Волкова',
    realName: 'Анна Андреевна Волкова',
    roles: ['Vocalist', 'Songwriter'],
    description: 'Вокалистка и автор текстов',
    platformLinks: [
      { platform: 'spotify', url: 'https://open.spotify.com/artist/anna-volkova', verified: true },
      { platform: 'yandex', url: 'https://music.yandex.ru/artist/anna-volkova', verified: true }
    ]
  },
  {
    id: 'max-steel',
    displayName: 'Max Steel',
    roles: ['Producer', 'MixEngineer'],
    description: 'Продюсер и звукорежиссер',
    platformLinks: [
      { platform: 'spotify', url: 'https://open.spotify.com/artist/max-steel', verified: true }
    ]
  },
  {
    id: 'elena-bright',
    displayName: 'Elena Bright',
    realName: 'Елена Светлова',
    roles: ['FeaturedArtist', 'Vocalist'],
    description: 'Приглашенная вокалистка',
    platformLinks: [
      { platform: 'yandex', url: 'https://music.yandex.ru/artist/elena-bright', verified: true },
      { platform: 'vk', url: 'https://vk.com/elena_bright', verified: false }
    ]
  },
  {
    id: 'dj-storm',
    displayName: 'DJ Storm',
    roles: ['Remixer', 'Producer'],
    description: 'DJ и ремиксер электронной музыки',
    platformLinks: [
      { platform: 'spotify', url: 'https://open.spotify.com/artist/dj-storm', verified: true },
      { platform: 'youtubeMusic', url: 'https://music.youtube.com/channel/dj-storm', verified: false }
    ]
  },
  {
    id: 'sarah-jones',
    displayName: 'Sarah Jones',
    roles: ['Songwriter', 'Composer'],
    description: 'Автор песен и композитор',
    platformLinks: [
      { platform: 'spotify', url: 'https://open.spotify.com/artist/sarah-jones', verified: true },
      { platform: 'appleMusic', url: 'https://music.apple.com/artist/sarah-jones', verified: true },
      { platform: 'deezer', url: 'https://deezer.com/artist/sarah-jones', verified: false }
    ]
  },
  {
    id: 'bass-master',
    displayName: 'Bass Master',
    roles: ['Producer', 'MixEngineer'],
    description: 'Специалист по басовым линиям',
    platformLinks: [
      { platform: 'bandLink', url: 'https://band.link/bass-master', verified: true }
    ]
  },
  {
    id: 'vocal-harmony',
    displayName: 'Vocal Harmony',
    roles: ['Vocalist', 'Arranger'],
    description: 'Вокальные гармонии и аранжировки',
    platformLinks: [
      { platform: 'spotify', url: 'https://open.spotify.com/artist/vocal-harmony', verified: true },
      { platform: 'yandex', url: 'https://music.yandex.ru/artist/vocal-harmony', verified: true },
      { platform: 'zvook', url: 'https://zvook.com/artist/vocal-harmony', verified: false }
    ]
  },
  {
    id: 'mike-producer',
    displayName: 'Mike Producer',
    realName: 'Михаил Продюсеров',
    roles: ['Producer', 'MasteringEngineer'],
    description: 'Продюсер и мастеринг-инженер',
    isni: '0000-0002-3456-7890',
    platformLinks: [
      { platform: 'spotify', url: 'https://open.spotify.com/artist/mike-producer', verified: true },
      { platform: 'appleMusic', url: 'https://music.apple.com/artist/mike-producer', verified: true }
    ]
  },
  {
    id: 'strings-section',
    displayName: 'Strings Section',
    roles: ['Arranger'],
    description: 'Струнная секция и аранжировки',
    platformLinks: [
      { platform: 'yandex', url: 'https://music.yandex.ru/artist/strings-section', verified: true }
    ]
  }
]

// Функция поиска участников (простая версия)
export function searchParticipantsBasic(query: string): ParticipantSuggestion[] {
  if (!query || query.length < 2) return []
  
  const lowercaseQuery = query.toLowerCase()
  
  return DEMO_PARTICIPANTS.filter(participant => {
    const nameMatch = participant.displayName.toLowerCase().includes(lowercaseQuery)
    const realNameMatch = participant.realName?.toLowerCase().includes(lowercaseQuery)
    const descriptionMatch = participant.description?.toLowerCase().includes(lowercaseQuery)
    
    return nameMatch || realNameMatch || descriptionMatch
  }).slice(0, 10) // Ограничиваем результаты
}