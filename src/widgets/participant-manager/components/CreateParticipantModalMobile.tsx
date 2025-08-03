'use client'

import React, { useState } from 'react'
import { Plus, Trash2, User, Hash, ExternalLink, Check, ChevronsUpDown, HelpCircle, ArrowLeft, X } from 'lucide-react'
import { getPlatformInfo, PLATFORMS } from '@/lib/platforms'
import { PARTICIPANT_ROLES } from '../constants/participantRoles'
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
  PlatformLink, 
  PlatformType, 
  CreateParticipantModalProps 
} from '../types/participant.types'

// Мобильная версия модального окна - полноэкранная
export function CreateParticipantModalMobile({
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
  const [currentStep, setCurrentStep] = useState<'basic' | 'platforms' | 'identifiers'>('basic')

  // Сброс формы при открытии/закрытии
  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          displayName: initialData.displayName || '',
          realName: initialData.realName || '',
          description: '',
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
        setPlatformLinks([])
      }
      setCurrentStep('basic')
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
    setPlatformLinks(prev => [newLink, ...prev])
  }, [])

  const updatePlatformLink = (index: number, field: keyof { platform: PlatformType, url: string, verified: boolean, customName?: string }, value: any) => {
    if (field !== 'platform') {
      setPlatformLinks(prev => prev.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      ))
    }
  }

  const removePlatformLink = (index: number) => {
    setPlatformLinks(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
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
      roles: ['MainArtist'],
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Заголовок с навигацией */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {mode === 'edit' ? 'Редактировать участника' : 'Новый участник'}
            </h1>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!formData.displayName.trim()}
          size="sm"
          className="px-4"
        >
          {mode === 'edit' ? 'Сохранить' : 'Создать'}
        </Button>
      </div>

      {/* Навигация по шагам */}
      <div className="flex border-b border-border bg-muted/20">
        {[
          { key: 'basic', label: 'Основное', icon: User },
          { key: 'platforms', label: 'Площадки', icon: ExternalLink },
          { key: 'identifiers', label: 'ID', icon: Hash }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCurrentStep(key as any)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              currentStep === key
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto p-4 pb-safe">
        {currentStep === 'basic' && (
          <div className="space-y-6">
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

            <div className="relative">
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  handleInputChange('description', e.target.value)
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                }}
                placeholder=" "
                rows={3}
                className="peer w-full bg-background border border-input rounded-lg px-3 pt-6 pb-2 text-foreground placeholder:text-transparent placeholder-shown:border-input transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary resize-none overflow-y-auto min-h-[4rem] max-h-[120px] leading-normal"
              />
              <label
                htmlFor="description"
                className="absolute left-3 transition-all duration-200 ease-out pointer-events-none text-muted-foreground bg-background px-1 select-none top-0 -translate-y-1/2 text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base"
              >
                Примечание
              </label>
            </div>
          </div>
        )}

        {currentStep === 'platforms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">Ссылки на площадки</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addPlatformLink('spotify')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить
              </Button>
            </div>

            <div className="space-y-3">
              {platformLinks.map((link, index) => {
                const platformInfo = getPlatformInfo(link.platform)
                const PlatformIcon = usePlatformIcon(link.platform)
                
                return (
                  <div key={index} className="border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <PlatformIcon />
                      <span className="font-medium text-sm">{platformInfo.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlatformLink(index)}
                        className="ml-auto h-6 w-6 p-0 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={link.url}
                      onChange={(e) => updatePlatformLink(index, 'url', e.target.value)}
                      placeholder={`Ссылка на ${platformInfo.name}...`}
                      className="text-sm"
                    />
                  </div>
                )
              })}
              
              {platformLinks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Нет добавленных площадок</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'identifiers' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              <h3 className="text-base font-medium">Профессиональные идентификаторы</h3>
            </div>
            
            <div className="space-y-4">
              <ISNIInput
                id="isni"
                value={formData.isni}
                onChange={(e) => handleInputChange('isni', e.target.value)}
              />
              
              <IPIInput
                id="ipi"
                value={formData.ipi}
                onChange={(e) => handleInputChange('ipi', e.target.value)}
              />
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="mb-2 font-medium">Справка:</p>
              <p className="mb-1"><strong>ISNI</strong> - международный идентификатор для авторов и исполнителей</p>
              <p><strong>IPI</strong> - идентификатор для управления авторскими правами</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}