'use client'

import React, { useState } from 'react'
import { Plus, Trash2, User, Hash, ExternalLink, Check, ChevronsUpDown } from 'lucide-react'
import { ParticipantSuggestion, PlatformLink, PlatformType } from '@/data/participants'
import { getPlatformInfo, PLATFORMS } from '@/lib/platforms'
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

interface CreateParticipantModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateParticipant: (participant: ParticipantSuggestion) => void
  initialDisplayName?: string
}

// Компонент для выбора платформы с иконкой
interface PlatformComboboxProps {
  value: PlatformType
  onChange: (value: PlatformType) => void
}

function PlatformCombobox({ value, onChange }: PlatformComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const selectedPlatform = getPlatformInfo(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between"
        >
          <div className="flex items-center gap-2">
            <img
              src={selectedPlatform.icon}
              alt={selectedPlatform.name}
              className="w-4 h-4"
            />
            <span className="truncate">{selectedPlatform.name}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[180px] p-0">
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
                  <div className="flex items-center gap-2 flex-1">
                    <img
                      src={platform.icon}
                      alt={platform.name}
                      className="w-4 h-4"
                    />
                    <span>{platform.name}</span>
                  </div>
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
  initialDisplayName = ''
}: CreateParticipantModalProps) {
  const [formData, setFormData] = useState({
    displayName: initialDisplayName,
    realName: '',
    description: '',
    isni: '',
    ipi: ''
  })
  
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([])

  // Сброс формы при открытии/закрытии  
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        displayName: initialDisplayName,
        realName: '',
        description: '',
        isni: '',
        ipi: ''
      })
      // По умолчанию добавляем 4 основные площадки
      setPlatformLinks([
        { platform: 'yandex', url: '', verified: false },
        { platform: 'appleMusic', url: '', verified: false },
        { platform: 'spotify', url: '', verified: false },
        { platform: 'bandLink', url: '', verified: false }
      ])
    }
  }, [isOpen, initialDisplayName])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addPlatformLink = () => {
    setPlatformLinks(prev => [...prev, {
      platform: 'spotify',
      url: '',
      verified: false
    }])
  }

  const updatePlatformLink = (index: number, field: keyof PlatformLink, value: any) => {
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
      platformLinks: platformLinks.filter(link => link.url.trim())
    }

    onCreateParticipant(newParticipant)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать нового участника</DialogTitle>
          <DialogDescription>
            Добавьте информацию о новом участнике релиза
          </DialogDescription>
        </DialogHeader>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <PlatformCombobox
                        value={link.platform}
                        onChange={(value) => updatePlatformLink(index, 'platform', value)}
                      />
                      <Input
                        value={link.url}
                        onChange={(e) => updatePlatformLink(index, 'url', e.target.value)}
                        placeholder="https://..."
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlatformLink(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={!formData.displayName.trim()}
            >
              Создать участника
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Отменить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}