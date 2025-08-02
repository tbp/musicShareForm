'use client'

import React, { useState } from 'react'
import { Plus, Trash2, User, Hash, ExternalLink, Check, ChevronsUpDown, Tags } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
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
  PlatformLink, 
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
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 text-muted-foreground rounded text-xs border border-border/30">
      <IconComponent className="h-3 w-3" />
      <span>{role.displayName}</span>
    </div>
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

// Компонент для элемента в списке платформ
function PlatformListItem({ platformId }: { platformId: PlatformType }) {
  const PlatformIcon = usePlatformIcon(platformId)
  const platformInfo = getPlatformInfo(platformId)
  
  return (
    <div className="flex items-center gap-2 flex-1">
      {React.createElement(PlatformIcon, {
        size: 'md',
        'aria-label': platformInfo.name
      })}
      <span>{platformInfo.name}</span>
    </div>
  )
}

// Компонент для выбора платформы с иконкой
interface PlatformComboboxProps {
  value: PlatformType | ''
  onChange: (value: PlatformType) => void
  className?: string
}

function PlatformCombobox({ value, onChange, className }: PlatformComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selectedPlatform = value ? getPlatformInfo(value) : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-w-0", className)}
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
              {Object.values(PLATFORMS).map((platform) => (
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
  
  const [platformLinks, setPlatformLinks] = useState<Array<{ platform: PlatformType | '', url: string, verified: boolean }>>([])  

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
        setPlatformLinks(initialData.platformLinks || [
          { platform: '', url: '', verified: false },
          { platform: '', url: '', verified: false },
          { platform: '', url: '', verified: false },
          { platform: '', url: '', verified: false }
        ])
      } else {
        setFormData({
          displayName: initialDisplayName,
          realName: '',
          description: '',
          isni: '',
          ipi: ''
        })
        // По умолчанию добавляем 4 поля без выбранной платформы
        setPlatformLinks([
          { platform: '', url: '', verified: false },
          { platform: '', url: '', verified: false },
          { platform: '', url: '', verified: false },
          { platform: '', url: '', verified: false }
        ])
      }
    }
  }, [isOpen, initialDisplayName, initialData, mode])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addPlatformLink = () => {
    setPlatformLinks(prev => [{
      platform: '', // Не выбираем платформу по умолчанию
      url: '',
      verified: false
    }, ...prev])
  }

  const updatePlatformLink = (index: number, field: keyof { platform: PlatformType | '', url: string, verified: boolean }, value: any) => {
    setPlatformLinks(prev => prev.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ))
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
        .filter(link => link.url.trim() && link.platform)
        .map(link => ({
          platform: link.platform as PlatformType,
          url: link.url,
          verified: link.verified
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
          <form id="create-participant-form" onSubmit={handleSubmit} className="space-y-6 pb-6">

          {/* Роли участника в виде тегов */}
          {relevantRoles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Роли в проектах
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {relevantRoles.map(roleKey => (
                  <RoleTag key={roleKey} roleKey={roleKey} />
                ))}
              </div>
            </div>
          )}

          {/* Основная информация */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Основная информация
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Имя артиста *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  placeholder="Например: Gaeor"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="realName">Настоящее имя</Label>
                <Input
                  id="realName"
                  value={formData.realName}
                  onChange={(e) => handleInputChange('realName', e.target.value)}
                  placeholder="Например: Георгий Акопов"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Например: Артист, композитор, продюсер"
              />
            </div>
          </div>

          {/* Профессиональные идентификаторы */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Профессиональные идентификаторы
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isni">ISNI</Label>
                <Input
                  id="isni"
                  value={formData.isni}
                  onChange={(e) => handleInputChange('isni', e.target.value)}
                  placeholder="0000-0001-2345-6789"
                  pattern="\d{4}-\d{4}-\d{4}-\d{4}"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ipi">IPI</Label>
                <Input
                  id="ipi"
                  value={formData.ipi}
                  onChange={(e) => handleInputChange('ipi', e.target.value)}
                  placeholder="00123456789"
                  pattern="\d{11}"
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPlatformLink}
                className="flex items-center gap-2"
              >
                <Plus className="h-3 w-3" />
                Добавить ссылку
              </Button>
            </div>

            {platformLinks.length > 0 && (
              <div className="space-y-3">
                {platformLinks.map((link, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {/* Платформа - шире */}
                        <div className="w-48">
                          <PlatformCombobox
                            value={link.platform}
                            onChange={(value) => updatePlatformLink(index, 'platform', value)}
                            className="w-full"
                          />
                        </div>
                        
                        {/* Ссылка - уже */}
                        <div className="flex-1">
                          <div className="relative">
                            <Input
                              value={link.url}
                              onChange={(e) => updatePlatformLink(index, 'url', e.target.value)}
                              placeholder="https://..."
                              className="pr-10"
                            />
                            
                            {/* Кнопка перехода по ссылке - встроенная иконка */}
                            {link.url.trim() && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1 h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => window.open(link.url, '_blank')}
                                title="Открыть ссылку"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlatformLink(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                )}
              </div>
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