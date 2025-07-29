// Основные жанры музыки
export interface Genre {
  value: string
  label: string
}

export interface GenreCategory {
  title: string
  value: string
  subgenres: Genre[]
}

export const GENRES: Genre[] = [
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'hip-hop', label: 'Hip Hop' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'classical', label: 'Classical' },
  { value: 'country', label: 'Country' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'folk', label: 'Folk' },
  { value: 'rnb', label: 'R&B' },
  { value: 'blues', label: 'Blues' },
  { value: 'metal', label: 'Metal' },
  { value: 'punk', label: 'Punk' },
  { value: 'indie', label: 'Indie' },
  { value: 'alternative', label: 'Alternative' },
  { value: 'world', label: 'World Music' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'experimental', label: 'Experimental' }
]

// Поджанры для каждого основного жанра
export const SUBGENRES: Record<string, Genre[]> = {
  rock: [
    { value: 'alternative-rock', label: 'Alternative Rock' },
    { value: 'classic-rock', label: 'Classic Rock' },
    { value: 'hard-rock', label: 'Hard Rock' },
    { value: 'progressive-rock', label: 'Progressive Rock' },
    { value: 'psychedelic-rock', label: 'Psychedelic Rock' },
    { value: 'indie-rock', label: 'Indie Rock' }
  ],
  pop: [
    { value: 'pop-rock', label: 'Pop Rock' },
    { value: 'synth-pop', label: 'Synth Pop' },
    { value: 'dance-pop', label: 'Dance Pop' },
    { value: 'electropop', label: 'Electropop' },
    { value: 'teen-pop', label: 'Teen Pop' },
    { value: 'art-pop', label: 'Art Pop' }
  ],
  'hip-hop': [
    { value: 'trap', label: 'Trap' },
    { value: 'old-school', label: 'Old School' },
    { value: 'gangsta-rap', label: 'Gangsta Rap' },
    { value: 'conscious-rap', label: 'Conscious Rap' },
    { value: 'mumble-rap', label: 'Mumble Rap' },
    { value: 'boom-bap', label: 'Boom Bap' }
  ],
  electronic: [
    { value: 'house', label: 'House' },
    { value: 'techno', label: 'Techno' },
    { value: 'trance', label: 'Trance' },
    { value: 'dubstep', label: 'Dubstep' },
    { value: 'drum-and-bass', label: 'Drum and Bass' },
    { value: 'ambient', label: 'Ambient' },
    { value: 'downtempo', label: 'Downtempo' },
    { value: 'electro', label: 'Electro' }
  ],
  jazz: [
    { value: 'bebop', label: 'Bebop' },
    { value: 'smooth-jazz', label: 'Smooth Jazz' },
    { value: 'fusion', label: 'Fusion' },
    { value: 'free-jazz', label: 'Free Jazz' },
    { value: 'swing', label: 'Swing' },
    { value: 'latin-jazz', label: 'Latin Jazz' }
  ],
  classical: [
    { value: 'baroque', label: 'Baroque' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'modern', label: 'Modern' },
    { value: 'opera', label: 'Opera' },
    { value: 'chamber', label: 'Chamber Music' },
    { value: 'symphony', label: 'Symphony' }
  ],
  country: [
    { value: 'bluegrass', label: 'Bluegrass' },
    { value: 'country-pop', label: 'Country Pop' },
    { value: 'honky-tonk', label: 'Honky Tonk' },
    { value: 'alt-country', label: 'Alt Country' },
    { value: 'country-rock', label: 'Country Rock' }
  ],
  metal: [
    { value: 'heavy-metal', label: 'Heavy Metal' },
    { value: 'death-metal', label: 'Death Metal' },
    { value: 'black-metal', label: 'Black Metal' },
    { value: 'power-metal', label: 'Power Metal' },
    { value: 'progressive-metal', label: 'Progressive Metal' },
    { value: 'metalcore', label: 'Metalcore' }
  ]
} 