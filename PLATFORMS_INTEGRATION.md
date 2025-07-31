# Интеграция музыкальных площадок

## Обзор функциональности

Система автокомплита участников теперь поддерживает:
- Ссылки на основные музыкальные площадки
- Профессиональные идентификаторы (ISNI, IPI)
- Визуальные индикаторы платформ
- Детальную информацию об артистах
- Возможность создания новых артистов

## Поддерживаемые платформы

### Основные платформы
- **Spotify** - `spotify.svg`
- **Яндекс Музыка** - `yandex-icon.svg`
- **VK Музыка** - `vk.svg`
- **Звук** - `zvook.svg`
- **Apple Music** - `apple-music.svg`
- **YouTube Music** - `youtube-music.svg`
- **Deezer** - `deezer.svg`
- **BandLink** - `bandlink.svg`

## Компоненты

### 1. ParticipantAutocomplete (обновлен)
Основной компонент автокомплита с новыми возможностями:

```tsx
<ParticipantAutocomplete
  value={artistName}
  onChange={setArtistName}
  onSelectParticipant={(participant) => {
    // Обработка выбранного участника
  }}
/>
```

#### Новые возможности:
- Показ до 3 иконок платформ в списке предложений
- Индикатор "+N" для дополнительных платформ
- Кнопка информации (ℹ️) для артистов с платформами
- Предложение создать нового артиста если не найден

### 2. ArtistPlatformsPopover
Popover с детальной информацией об артисте:

```tsx
<ArtistPlatformsPopover participant={selectedParticipant}>
  <Button>Показать информацию</Button>
</ArtistPlatformsPopover>
```

#### Отображает:
- Настоящее имя артиста
- Профессиональные идентификаторы (ISNI, IPI)
- Ссылки на все музыкальные площадки
- Статус верификации ссылок

### 3. CreateArtistModal
Модальное окно для создания нового артиста:

```tsx
<CreateArtistModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onCreateArtist={(newArtist) => {
    // Обработка созданного артиста
  }}
  initialDisplayName="Gaeor"
/>
```

#### Поля формы:
- Имя артиста (обязательно)
- Настоящее имя
- Описание
- Роли (множественный выбор)
- ISNI и IPI коды
- Ссылки на платформы с выбором типа

## Типы данных

### ParticipantSuggestion (расширен)
```typescript
interface ParticipantSuggestion {
  id: string
  displayName: string
  realName?: string
  roles: string[]
  description?: string
  isni?: string // International Standard Name Identifier
  ipi?: string // Interested Parties Information
  platformLinks?: PlatformLink[]
}
```

### PlatformLink
```typescript
interface PlatformLink {
  platform: PlatformType
  url: string
  verified?: boolean
}
```

### PlatformType
```typescript
type PlatformType = 
  | 'spotify' | 'yandex' | 'vk' | 'zvook' 
  | 'appleMusic' | 'youtubeMusic' | 'deezer' | 'bandLink'
```

## Пример данных артиста

```typescript
{
  id: 'gaeor',
  displayName: 'Gaeor',
  realName: 'Георгий Акопов',
  roles: ['MainArtist', 'Composer', 'Songwriter', 'Producer'],
  description: 'Артист, композитор, продюсер',
  isni: '0000-0001-2345-6789',
  ipi: '00123456789',
  platformLinks: [
    {
      platform: 'yandex',
      url: 'https://music.yandex.ru/artist/23921646',
      verified: true
    },
    {
      platform: 'appleMusic',
      url: 'https://music.apple.com/ca/artist/gaeor/1800441644',
      verified: true
    }
  ]
}
```

## Поведение пользовательского интерфейса

### В автокомплите:
1. При вводе 2+ символов показываются предложения
2. Рядом с именем отображаются иконки до 3 платформ
3. Если платформ больше 3, показывается "+N"
4. В конце списка кнопка "Создать [имя]"

### При выборе артиста:
1. Если у артиста есть ссылки на платформы, справа от поля появляется кнопка ℹ️
2. Клик по кнопке ℹ️ открывает popover с информацией
3. В popover можно перейти по ссылкам на платформы

### При создании нового артиста:
1. Открывается модальное окно с формой
2. Можно заполнить все доступные поля
3. Ссылки на платформы добавляются динамически
4. После создания артист автоматически выбирается

## Использование в участниках релиза

Обновленный автокомплит уже интегрирован в секцию участников релиза и готов к использованию с существующими и новыми данными артистов.