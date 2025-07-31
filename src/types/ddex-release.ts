/* ======================= TYPE DEFINITIONS ===================== */

type ISO8601 = `${string}-${string}-${string}`          // e.g. 2025-03-06
type URI = `https://${string}`

export interface ArtistCredit {
  id?: string // Уникальный ID для UI (опциональный для обратной совместимости)
  displayName: string
  role: 'MainArtist' | 'FeaturedArtist' | 'Remixer' | 'Producer' | 'Vocalist' | 'Songwriter' | 'Composer' | 'Arranger' | 'MixEngineer' | 'MasteringEngineer'
  share: number // Доля в процентах
  sequence?: number
  copyrightShare?: number // Доля в авторских правах (до 100%)
  relatedRightsShare?: number // Доля в смежных правах (до 100%)
}

export interface Contributor {
  name: string
  role: 'Composer' | 'Lyricist' | 'Producer' | 'Arranger'
}

export interface CopyrightInfo {
  text: string
  type: 'PLine' | 'CLine'
  year: number
}

/* ---------- Core entities (aligned with DDEX ERN 4.1) ---------- */

export interface Release {
  releaseId: string          // UPC
  title: string
  releaseType: 'Single' | 'EP' | 'Album' | 'Compilation'
  releaseDate: ISO8601
  genre: string
  subGenre?: string
  parentalAdvisory: 'Explicit' | 'NotExplicit' | 'Edited'
  label: string
  artists: ArtistCredit[]
  copyright: CopyrightInfo[]
  coverArt: CoverArt
  resources: ReleaseResourceReference[]
}

export interface ReleaseResourceReference {
  trackNumber: number
  isrc: string
}

export interface SoundRecording {
  isrc: string
  title: string
  durationSeconds: number
  bpm?: number
  sampleRate?: number
  bitDepth?: number
  channels?: number
  language: string
  contributors: Contributor[]
  audioFile: AudioFile
  previews: PreviewClip[]
  lyricFiles: LyricFile[]
}

/* ------------- Resource-specific supporting types ------------- */

export interface AudioFile {
  uri: URI
  codec: 'PCM' | 'FLAC' | 'AAC' | 'MP3'
  sizeMB: number
}

export interface PreviewClip {
  uri: URI
  startSeconds: number
  durationSeconds: number
}

export interface LyricFile {
  format: 'txt' | 'lrc' | 'ttml'
  uri: URI
}

export interface CoverArt {
  uri: URI
  width: number
  height: number
  mimeType: 'image/jpeg' | 'image/png'
}

/* ======================= FORM DATA TYPES ====================== */

export interface ReleaseFormData {
  // Basic Info
  title: string
  subtitle?: string
  releaseType: 'Single' | 'EP' | 'Album' | 'Compilation' | ''
  variousArtists: boolean
  releaseDate: string
  recordingYear?: string
  originalReleaseDate?: string
  genre: string
  subGenre?: string
  parentalAdvisory: 'Explicit' | 'NotExplicit' | 'Edited' | ''
  label: string
  upc?: string
  
  // Identifiers
  releaseId?: string // UPC
  
  // Artists
  artists: ArtistCredit[]
  
  // Copyright
  copyright: CopyrightInfo[]
  
  // Description
  notes?: string
}

export interface TrackFormData {
  // Basic Info
  title: string
  trackNumber: number
  durationSeconds?: number
  
  // Identifiers
  isrc?: string
  
  // Technical
  bpm?: number
  sampleRate?: number
  bitDepth?: number
  channels?: number
  language: string
  
  // Contributors
  contributors: Contributor[]
  
  // Lyrics Files
  lyricFiles?: LyricFile[]
}

/* ======================= DEMO DATASET ========================= */

export const demoRelease: {
  release: Release
  soundRecordings: SoundRecording[]
} = {
  release: {
    releaseId: "790522540718",
    title: "Режиссёр — Икигай",
    releaseType: "Single",
    releaseDate: "2025-03-06",
    genre: "Rock",
    subGenre: "Russian rock",
    parentalAdvisory: "NotExplicit",
    label: "IQ",
    artists: [
      { displayName: "Gaeor", role: "MainArtist", share: 100, sequence: 1 }
    ],
    copyright: [
      {
        text: "IQ / under exclusive license to OVOKACHO, 2025",
        type: "PLine",
        year: 2025
      },
      {
        text: "IQ / under exclusive license to OVOKACHO, 2025",
        type: "CLine",
        year: 2025
      }
    ],
    coverArt: {
      uri: "https://storage.yandexcloud.net/ovkch/albums/482021cb-a402-4586-8f36-28aa4237b938/artworks/freepik-the-style-is-candid-image-photography-with-natural-54833.jpeg",
      width: 3000,
      height: 3000,
      mimeType: "image/jpeg"
    },
    resources: [
      { trackNumber: 1, isrc: "QZGLS2528340" }
    ]
  },

  soundRecordings: [
    {
      isrc: "QZGLS2528340",
      title: "Режиссёр — Икигай",
      durationSeconds: 182,
      bpm: 138,
      sampleRate: 48000,
      bitDepth: 16,
      channels: 2,
      language: "Русский",
      contributors: [
        { name: "Suno", role: "Composer" },
        { name: "chatGPT", role: "Lyricist" }
      ],
      audioFile: {
        uri: "https://storage.yandexcloud.net/gaeor/%D0%A0%D0%B5%D0%B6%D0%B8%D1%81%D1%81%D0%B5%CC%88%D1%80%20%E2%80%94%20%D0%98%D0%BA%D0%B8%D0%B3%D0%B0%D0%B8%CC%86.wav",
        codec: "PCM",
        sizeMB: 29.54
      },
      previews: [
        {
          uri: "https://storage.yandexcloud.net/gaeor/%D0%A0%D0%B5%D0%B6%D0%B8%D1%81%D1%81%D0%B5%CC%88%D1%80%20%E2%80%94%20%D0%98%D0%BA%D0%B8%D0%B3%D0%B0%D0%B8%CC%86.wav?start=41.054&duration=30.0",
          startSeconds: 41.054,
          durationSeconds: 30.0
        }
      ],
      lyricFiles: [
        {
          format: "txt",
          uri: "https://storage.yandexcloud.net/ovkch/albums/482021cb-a402-4586-8f36-28aa4237b938/lyrics/%D0%A0%D0%B5%D0%B6%D0%B8%D1%81%D1%81%D0%B5%D1%80-%D0%98%D0%BA%D0%B8%D0%B3%D0%B0%D0%B8-.txt"
        },
        {
          format: "lrc",
          uri: "https://storage.yandexcloud.net/ovkch/albums/482021cb-a402-4586-8f36-28aa4237b938/lyrics/%D0%A0%D0%B5%D0%B6%D0%B8%D1%81%D1%81%D0%B5-%D1%80-%D0%98%D0%BA%D0%B8%D0%B3%D0%B0%D0%B8-.lrc"
        },
        {
          format: "ttml",
          uri: "https://storage.yandexcloud.net/ovkch/albums/482021cb-a402-4586-8f36-28aa4237b938/lyrics/%D0%A0%D0%B5%D0%B6%D0%B8%D1%81%D1%81%D0%B5-%D1%80-%D0%98%D0%BA%D0%B8%D0%B3%D0%B0%D0%B8-4-.ttml"
        }
      ]
    }
  ]
} 