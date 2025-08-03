'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Hash, ExternalLink, Check, ChevronsUpDown, HelpCircle } from 'lucide-react'
import { getPlatformInfo, PLATFORMS } from '@/lib/platforms'
import { PARTICIPANT_ROLES } from '../constants/participantRoles'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedInput } from '@/components/ui/animated-input'
import { ISNIInput } from './ISNIInput'
import { IPIInput } from './IPIInput'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { usePlatformIcon } from '@/components/shared/icons'

import type { 
  ParticipantSuggestion, 
  PlatformType, 
  CreateParticipantModalProps 
} from '../types/participant.types'

// Компонент для роли в виде тега
interface RoleTagProps {
  roleKey: string
}

function RoleTag({ roleKey }: RoleTagProps) {
  const role = PARTICIPANT_ROLES[roleKey as keyof typeof PARTICIPANT_ROLES]
  if (!role) return null
  
  const IconComponent = role.icon
  
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-muted/50 text-muted-foreground rounded text-xs border border-border/30">
      <IconComponent className="h-3 w-3" />
      {role.displayName}
    </span>
  )
}

// Компонент для иконки платформы в кнопке
function PlatformIconButton({ platformId }: { platformId: PlatformType }) {
  const PlatformIcon = usePlatformIcon(platformId)
  const platformInfo = getPlatformInfo(platformId)
  
  return React.createElement(PlatformIcon, {
    size: 'md',
    'aria-label': platformInfo.name
  })
}

// Компонент для иконки платформы
function PlatformIconComponent({ platformId }: { platformId: PlatformType }) {
  const PlatformIcon = usePlatformIcon(platformId)
  const platformInfo = getPlatformInfo(platformId)
  
  return React.createElement(PlatformIcon, {
    size: 'md',
    'aria-label': platformInfo.name
  })
}

// Компонент для элемента в списке платформ
function PlatformListItem({ platformId }: { platformId: PlatformType }) {
  const platformInfo = getPlatformInfo(platformId)
  
  return (
    <div className="flex items-center gap-2 flex-1">
      <PlatformIconComponent platformId={platformId} />
      <span>{platformInfo.name}</span>
    </div>
  )
}

// Компонент для выбора платформы с иконкой
interface PlatformComboboxProps {
  value: PlatformType | ''
  onChange: (value: PlatformType) => void
  className?: string
  availablePlatforms?: Array<{ id: PlatformType; name: string }>
}

function PlatformCombobox({ value, onChange, className, availablePlatforms }: PlatformComboboxProps) {
  const platformsToShow = availablePlatforms || Object.values(PLATFORMS)
  const [open, setOpen] = React.useState(false)
  const selectedPlatform = value ? getPlatformInfo(value) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-w-0 h-10 px-3 py-2", className)}
        >
          <div className="flex items-center gap-2 min-w-0">
            {selectedPlatform ? (
              <>
                <PlatformIconButton platformId={value as PlatformType} />
                <span className="truncate">{selectedPlatform.name}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Выберите платформу</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Поиск платформы..." />
          <CommandList>
            <CommandEmpty>Платформа не найдена.</CommandEmpty>
            <CommandGroup>
              {platformsToShow.map((platform) => (
                <CommandItem
                  key={platform.id}
                  value={platform.id}
                  onSelect={() => {
                    onChange(platform.id)
                    setOpen(false)
                  }}
                >
                  <PlatformListItem platformId={platform.id} />
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === platform.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function CreateParticipantModal({
  isOpen,
  onClose,
  onCreateParticipant,
  initialDisplayName = '',
  initialData,
  mode = 'create'
}: CreateParticipantModalProps) {
  const [formData, setFormData] = useState({
    displayName: initialDisplayName,
    realName: '',
    description: '',
    isni: '',
    ipi: ''
  })
  
  const [platformLinks, setPlatformLinks] = useState<Array<{ platform: PlatformType, url: string, verified: boolean, customName?: string }>>([])
  const [addPlatformOpen, setAddPlatformOpen] = useState(false)
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null)
  const [lastAddedPlatformIndex, setLastAddedPlatformIndex] = useState<number | null>(null)

  // Сброс формы при открытии/закрытии или загрузка данных для редактирования
  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          displayName: initialData.displayName || '',
          realName: initialData.realName || '',
          description: '', // Описание всегда пустое при редактировании
          isni: initialData.isni || '',
          ipi: initialData.ipi || ''
        })
        setPlatformLinks(initialData.platformLinks || [])
      } else {
        setFormData({
          displayName: initialDisplayName,
          realName: '',
          description: '',
          isni: '',
          ipi: ''
        })
        // Для нового участника автоматически добавляем основные платформы
        const defaultPlatforms: Array<{ platform: PlatformType, url: string, verified: boolean }> = [
          { platform: 'bandLink', url: '', verified: false },
          { platform: 'yandex', url: '', verified: false },
          { platform: 'vk', url: '', verified: false },
          { platform: 'zvook', url: '', verified: false },
          { platform: 'appleMusic', url: '', verified: false },
          { platform: 'spotify', url: '', verified: false },
          { platform: 'youtubeMusic', url: '', verified: false },
          { platform: 'deezer', url: '', verified: false }
        ]
        setPlatformLinks(defaultPlatforms)
      }
      // Сброс состояний интерфейса платформ
      setAddPlatformOpen(false)
      setEditingNameIndex(null)
      setLastAddedPlatformIndex(null)
    }
  }, [isOpen, initialDisplayName, initialData, mode])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addPlatformLink = React.useCallback((platformId: PlatformType) => {
    const newLink = {
      platform: platformId,
      url: '',
      verified: false,
      ...(platformId === 'other' && { customName: '' })
    }
    setPlatformLinks(prev => {
      const newLinks = [newLink, ...prev]
      setLastAddedPlatformIndex(0) // Новая площадка всегда добавляется в начало
      return newLinks
    })
    setAddPlatformOpen(false)
  }, [])

  // Получаем список доступных платформ (исключая уже добавленные, кроме "other")
  const getAvailablePlatforms = React.useCallback(() => {
    const usedPlatforms = platformLinks.map(link => link.platform)
    return Object.values(PLATFORMS).filter(platform => 
      !usedPlatforms.includes(platform.id) || platform.id === 'other'
    )
  }, [platformLinks])

  // Фокус в input ссылки после добавления площадки
  React.useEffect(() => {
    if (lastAddedPlatformIndex !== null) {
      setTimeout(() => {
        const urlInput = document.querySelector(`[data-platform-index="${lastAddedPlatformIndex}"] input[placeholder*="Ссылка"]`) as HTMLInputElement
        if (urlInput) {
          urlInput.focus()
        }
        setLastAddedPlatformIndex(null)
      }, 100)
    }
  }, [lastAddedPlatformIndex])

  const updatePlatformLink = (index: number, field: keyof { platform: PlatformType, url: string, verified: boolean, customName?: string }, value: any) => {
    // Можно обновлять только URL, verified и customName, platform менять нельзя
    if (field !== 'platform') {
      setPlatformLinks(prev => prev.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ))
    }
  }

  const removePlatformLink = (index: number) => {
    setPlatformLinks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.displayName.trim()) {
      return
    }

    const newParticipant: ParticipantSuggestion = {
      id: `custom-${Date.now()}`,
      displayName: formData.displayName.trim(),
      realName: formData.realName.trim() || undefined,
      description: formData.description.trim() || undefined,
      isni: formData.isni.trim() || undefined,
      ipi: formData.ipi.trim() || undefined,
      roles: ['MainArtist'], // Фиксированная роль, устанавливается пользователем при добавлении в трек
      platformLinks: platformLinks
        .filter(link => link.url.trim())
        .map(link => ({
          platform: link.platform,
          url: link.url,
          verified: link.verified,
          ...(link.platform === 'other' && link.customName && { customName: link.customName })
        }))
    }

    onCreateParticipant(newParticipant)
    onClose()
  }

  // Получаем роли для показа - только релевантные
  const participantRoles = mode === 'edit' && initialData?.roles 
    ? initialData.roles 
    : ['MainArtist'] // По умолчанию

  // Показываем только роли, которые есть у участника (не все возможные роли)
  const relevantRoles = Object.keys(PARTICIPANT_ROLES).filter(roleKey => 
    participantRoles.includes(roleKey)
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6 pb-0">
          <DialogHeader>
            <DialogTitle>
              {mode === 'edit' ? 'Редактировать участника' : 'Создать нового участника'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'edit' 
                ? 'Измените информацию участника релиза'
                : 'Добавьте информацию о новом участнике релиза'
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Скроллируемый контент с кастомным скроллом */}
        <div className="flex-1 overflow-y-auto px-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-border/80">
          <form id="create-participant-form" onSubmit={handleSubmit} className="space-y-6 pb-6 pt-6">



          {/* Основная информация */}
          <div className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <AnimatedInput
                  id="displayName"
                  label="Имя артиста"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Gaeor"
                  required
                />
              </div>
              
              <div>
                <AnimatedInput
                  id="realName"
                  label="Настоящее имя"
                  value={formData.realName}
                  onChange={(e) => handleInputChange('realName', e.target.value)}
                  placeholder="Георгий Акопов"
                />
              </div>
            </div>

            <div className="relative">
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  handleInputChange('description', e.target.value)
                  // Автоматическое изменение высоты
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 100) + 'px'
                }}
                placeholder=" "
                rows={1}
                className="peer w-full bg-background border border-input rounded-lg px-3 pt-6 pb-2 text-foreground placeholder:text-transparent placeholder-shown:border-input transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary resize-none overflow-y-auto min-h-[2.5rem] max-h-[100px] leading-normal"
                style={{ height: 'auto' }}
              />
              <label
                htmlFor="description"
                className="absolute left-3 transition-all duration-200 ease-out pointer-events-none text-muted-foreground bg-background px-1 select-none top-0 -translate-y-1/2 text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base"
              >
                Примечание
              </label>
            </div>

            {/* Роли участника в виде тегов */}
            {relevantRoles.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Роли в треках:</div>
                <div className="flex flex-wrap gap-2">
                  {relevantRoles.map(roleKey => (
                    <RoleTag key={roleKey} roleKey={roleKey} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Профессиональные идентификаторы */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Профессиональные идентификаторы
              </h3>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    type="button"
                    className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-xs" side="right" align="start">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground mb-1">ISNI (International Standard Name Identifier)</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Международный стандартный идентификатор имени. Уникальный номер, который присваивается 
                        авторам, исполнителям и другим участникам творческой индустрии.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">IPI (Interested Parties Information)</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        Международный идентификатор заинтересованных сторон. Используется для идентификации 
                        авторов и издателей в системах управления правами.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border">
                      <p className="text-muted-foreground/80 text-xs">
                        Эти идентификаторы помогают точно идентифицировать участников и упрощают 
                        распределение авторских отчислений.
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ISNIInput
                  id="isni"
                  value={formData.isni}
                  onChange={(e) => handleInputChange('isni', e.target.value)}
                />
              </div>
              
              <div>
                <IPIInput
                  id="ipi"
                  value={formData.ipi}
                  onChange={(e) => handleInputChange('ipi', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Ссылки на площадки */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Ссылки на площадки
              </h3>
              
              {/* Combobox для добавления площадки в один клик */}
              {getAvailablePlatforms().length > 0 && (
                <Popover open={addPlatformOpen} onOpenChange={setAddPlatformOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        const availablePlatforms = getAvailablePlatforms()
                        // Если остается только "другая" площадка - добавляем её сразу
                        if (availablePlatforms.length === 1 && availablePlatforms[0].id === 'other') {
                          addPlatformLink('other')
                        } else {
                          setAddPlatformOpen(true)
                        }
                      }}
                    >
                      <Plus className="h-3 w-3" />
                      Добавить площадку
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Поиск площадки..." />
                      <CommandList>
                        <CommandEmpty>Площадка не найдена.</CommandEmpty>
                        <CommandGroup>
                          {getAvailablePlatforms().map((platform) => (
                            <CommandItem
                              key={platform.id}
                              value={platform.id}
                              onSelect={() => addPlatformLink(platform.id)}
                              className="cursor-pointer"
                            >
                              <PlatformListItem platformId={platform.id} />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Список добавленных площадок */}
            {platformLinks.length > 0 ? (
              <div className="space-y-3">
                {platformLinks.map((link, index) => {
                  const platformInfo = getPlatformInfo(link.platform)
                  const isOtherPlatform = link.platform === 'other'
                  const rawDisplayName = isOtherPlatform 
                    ? (link.customName || 'Другая площадка') 
                    : platformInfo.name
                  
                  // Ограничиваем отображаемое название до 15 символов
                  const displayName = rawDisplayName.length > 15 
                    ? rawDisplayName.slice(0, 15) + '...' 
                    : rawDisplayName
                  
                  const placeholderName = isOtherPlatform 
                    ? (link.customName?.slice(0, 15) || 'площадку') 
                    : platformInfo.name.slice(0, 15)
                  
                  const isEditingName = editingNameIndex === index
                  
                  return (
                    <div key={index} className="relative" data-platform-index={index}>
                      {/* Input с иконкой платформы внутри */}
                      <div className="relative">
                        {/* Иконка и название платформы слева */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 max-w-36 z-10">
                          <div className="flex-shrink-0 h-4 w-4">
                            <PlatformIconComponent platformId={link.platform} />
                          </div>
                          
                          {/* Название платформы - inline редактирование для других */}
                          {isOtherPlatform && isEditingName ? (
                            <input
                              value={link.customName || ''}
                              onChange={(e) => {
                                const value = e.target.value.slice(0, 15) // Ограничиваем до 15 символов
                                updatePlatformLink(index, 'customName', value)
                              }}
                              onBlur={() => setEditingNameIndex(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === 'Escape') {
                                  setEditingNameIndex(null)
                                }
                              }}
                              placeholder="Название..."
                              maxLength={15}
                              className="text-sm font-medium text-foreground bg-transparent border-none outline-none p-0 w-24"
                              autoFocus
                            />
                          ) : (
                            <span 
                              className={cn(
                                "text-sm font-medium truncate",
                                isOtherPlatform 
                                  ? "cursor-pointer hover:text-foreground transition-colors text-muted-foreground" 
                                  : "text-muted-foreground",
                                isOtherPlatform && !link.customName && "text-muted-foreground/70 italic"
                              )}
                              onClick={() => isOtherPlatform && setEditingNameIndex(index)}
                              title={isOtherPlatform ? (link.customName ? `Редактировать: ${rawDisplayName}` : "Задать название") : undefined}
                            >
                              {isOtherPlatform && !link.customName ? "Задать название" : displayName}
                            </span>
                          )}
                        </div>
                        
                        {/* Input с отступом для иконки и кнопок */}
                        <Input
                          value={link.url}
                          onChange={(e) => updatePlatformLink(index, 'url', e.target.value)}
                          placeholder={`Ссылка на ${placeholderName}...`}
                          className="pl-40 pr-20"
                        />
                        
                        {/* Кнопки справа */}
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {/* Кнопка перехода по ссылке */}
                          {link.url.trim() && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() => window.open(link.url, '_blank')}
                              title="Открыть ссылку"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {/* Кнопка удаления */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePlatformLink(index)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Удалить площадку"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Состояние когда нет ни одной площадки
              <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-lg bg-muted/20">
                <ExternalLink className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">Ссылки на площадки не добавлены</p>
                <p className="text-xs text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
                  Используйте кнопку &quot;Добавить площадку&quot; чтобы указать профили участника на музыкальных сервисах
                </p>
              </div>
            )}
            
            {/* Подсказка когда все платформы добавлены */}
            {getAvailablePlatforms().length === 0 && platformLinks.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Все доступные площадки добавлены
              </p>
            )}
          </div>

          </form>
        </div>
        
        {/* Footer с кнопками - фиксированный внизу */}
        <div className="flex-shrink-0 px-6 py-4 bg-background border-t border-border relative before:absolute before:inset-x-0 before:top-0 before:h-4 before:bg-gradient-to-b before:from-background/0 before:to-background before:pointer-events-none">
          <div className="flex gap-3">
            <Button
              type="submit"
              form="create-participant-form"
              className="flex-1"
              disabled={!formData.displayName.trim()}
            >
              {mode === 'edit' ? 'Сохранить изменения' : 'Создать участника'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Отменить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}