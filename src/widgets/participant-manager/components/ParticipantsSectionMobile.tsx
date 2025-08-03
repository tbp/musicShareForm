'use client'

import React from 'react'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Edit3,
  Users,
  HelpCircle,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { PARTICIPANT_ROLES } from '../constants/participantRoles'

// DnD Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import {
  CSS
} from '@dnd-kit/utilities'

import type { 
  ArtistCredit, 
  ParticipantsSectionProps 
} from '../types/participant.types'
import { CreateParticipantModalResponsive } from './CreateParticipantModalResponsive'
import { ParticipantAutocomplete } from './ParticipantAutocomplete'
import { 
  useParticipants, 
  useSetParticipants,
  useUpdateParticipant,
  useAddParticipant,
  useRemoveParticipant,
  useMoveParticipant
} from '../stores/participant-store'

// Sortable карточка участника
interface SortableParticipantCardProps {
  participant: ArtistCredit
  index: number
  onUpdate: (index: number, field: string, value: unknown) => void
  onRemove: (index: number) => void
  onEdit?: (index: number, participant: ArtistCredit) => void
  isLastMainArtist: boolean
}

function SortableParticipantCard({
  participant,
  index,
  onUpdate,
  onRemove,
  onEdit,
  isLastMainArtist
}: SortableParticipantCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isDraggingFromKit,
  } = useSortable({ id: participant.id || `participant-${index}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const roleInfo = PARTICIPANT_ROLES[participant.role as keyof typeof PARTICIPANT_ROLES]
  const RoleIcon = roleInfo?.icon

  const roleOptions = Object.entries(PARTICIPANT_ROLES).map(([key, info]: [string, { displayName: string; icon: any }]) => ({
    value: key,
    label: info.displayName
  }))

  const handleEdit = () => {
    if (onEdit) {
      onEdit(index, participant)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border rounded-lg transition-all ${
        isDraggingFromKit ? 'opacity-50 scale-105 shadow-lg z-50' : ''
      }`}
    >
      <div className="p-3 space-y-3">
        {/* Верхняя строка: drag handle + номер + действия */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground transition-colors touch-none"
              title="Перетащите для изменения порядка"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            {/* Номер */}
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-medium">
              {index + 1}
            </span>

            {/* Иконка роли */}
            <div className="flex-shrink-0 w-6 h-6 rounded bg-primary/8 flex items-center justify-center">
              {RoleIcon && <RoleIcon className="h-3 w-3 text-primary" />}
            </div>
          </div>

          {/* Действия */}
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-7 w-7 p-0"
                title="Редактировать участника"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(index)}
              disabled={isLastMainArtist}
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              title={isLastMainArtist ? "Нельзя удалить последнего основного исполнителя" : "Удалить участника"}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Поле имени участника */}
        <div>
          <ParticipantAutocomplete
            value={participant.displayName}
            onChange={(value) => onUpdate(index, 'displayName', value)}
            onEditParticipant={onEdit ? () => handleEdit() : undefined}
            placeholder="Введите имя участника"
            showValidationError={true}
            className="h-10"
          />
        </div>

        {/* Роль */}
        <div>
          <SearchableSelect
            value={participant.role}
            onValueChange={(value) => onUpdate(index, 'role', value)}
            options={roleOptions}
            placeholder="Выберите роль"
            disabled={isLastMainArtist}
            className="h-10"
          />
          {isLastMainArtist && (
            <p className="text-xs text-muted-foreground mt-1">
              Нельзя изменить роль последнего основного исполнителя
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Компонент для DragOverlay
function ParticipantDragOverlay({ participant, index }: { participant: ArtistCredit, index: number }) {
  const roleInfo = PARTICIPANT_ROLES[participant.role as keyof typeof PARTICIPANT_ROLES]
  const RoleIcon = roleInfo?.icon

  return (
    <div className="bg-card border border-border rounded-lg shadow-xl rotate-3 scale-105">
      <div className="p-3 opacity-90">
        <div className="flex items-center gap-2 mb-2">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-medium">
            {index + 1}
          </span>
          <div className="flex-shrink-0 w-6 h-6 rounded bg-primary/8 flex items-center justify-center">
            {RoleIcon && <RoleIcon className="h-3 w-3 text-primary" />}
          </div>
        </div>
        <div className="h-10 bg-background border border-input rounded px-3 py-2 text-sm">
          {participant.displayName || 'Участник'}
        </div>
      </div>
    </div>
  )
}

// Превью участников для мобильной версии
interface ParticipantsPreviewMobileProps {
  participants: ArtistCredit[]
  formData: { variousArtists?: boolean }
  onInputChange: (field: string, value: unknown) => void
}

function ParticipantsPreviewMobile({ 
  participants, 
  formData,
  onInputChange
}: ParticipantsPreviewMobileProps) {
  const completedMainArtists = participants.filter(p => 
    p.role === 'MainArtist' && 
    p.displayName.trim().length >= 3
  )
  
  const completedFeaturedArtists = participants.filter(p => 
    p.role === 'FeaturedArtist' && 
    p.displayName.trim().length >= 3
  )
  
  if (completedMainArtists.length === 0) return null

  const formatArtistDisplay = () => {
    if (formData.variousArtists) {
      return 'Various Artists'
    }
    
    let artistString = ''
    
    if (completedMainArtists.length === 1) {
      artistString = completedMainArtists[0].displayName
    } else if (completedMainArtists.length === 2) {
      artistString = `${completedMainArtists[0].displayName}, ${completedMainArtists[1].displayName}`
    } else if (completedMainArtists.length > 2) {
      const firstTwo = completedMainArtists.slice(0, 2).map(a => a.displayName).join(', ')
      artistString = `${firstTwo}, and ${completedMainArtists.length - 2} more`
    }
    
    if (completedFeaturedArtists.length > 0) {
      const featuredString = completedFeaturedArtists.length === 1 
        ? completedFeaturedArtists[0].displayName
        : `${completedFeaturedArtists[0].displayName}${completedFeaturedArtists.length > 1 ? ` & ${completedFeaturedArtists.length - 1} other${completedFeaturedArtists.length > 2 ? 's' : ''}` : ''}`
      
      artistString += ` (feat. ${featuredString})`
    }
    
    return artistString
  }

  const shouldShowVariousArtistsToggle = completedMainArtists.length >= 3

  return (
    <div className="mt-4 p-4 bg-muted/20 rounded-lg">
      <div className="text-sm text-muted-foreground/80 leading-relaxed">
        <span className="font-medium">Отображение участников на стриминговых платформах:</span>
      </div>
      <div className="mt-2 text-base font-medium text-foreground">
        {formatArtistDisplay()}
      </div>
        
      {shouldShowVariousArtistsToggle && (
        <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border/30">
          <Switch
            id="variousArtists"
            checked={formData.variousArtists || false}
            onCheckedChange={(checked) => onInputChange('variousArtists', checked)}
          />
          <label 
            htmlFor="variousArtists" 
            className="text-sm text-muted-foreground cursor-pointer flex-1"
          >
            Various Artists
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors p-1">
                <HelpCircle className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm" side="top" align="start">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Various Artists</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Используется для сборников с множеством разных исполнителей (3+). 
                  Включите эту опцию для компиляций или сборников различных артистов.
                </p>
                <ul className="text-muted-foreground/80 space-y-0.5 ml-3 text-xs">
                  <li>• Помогает площадкам правильно категоризировать релиз</li>
                  <li>• Все участники сохраняются в метаданных</li>
                </ul>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}

// Основной мобильный компонент
export function ParticipantsSectionMobile({
  participants: externalParticipants,
  onParticipantsChange,
  errors,
  onInputChange
}: ParticipantsSectionProps) {
  // Zustand стор
  const participants = useParticipants()
  const setParticipants = useSetParticipants()
  const updateParticipant = useUpdateParticipant()
  const addParticipant = useAddParticipant()
  const removeParticipant = useRemoveParticipant()
  const moveParticipant = useMoveParticipant()
  
  // Локальное состояние
  const [isInitialized, setIsInitialized] = React.useState(false)
  const [editingParticipant, setEditingParticipant] = React.useState<{index: number, participant: ArtistCredit} | null>(null)
  const [variousArtists, setVariousArtists] = React.useState(false)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Синхронизация с внешним состоянием
  React.useEffect(() => {
    if (!isInitialized && externalParticipants && externalParticipants.length > 0) {
      setParticipants(externalParticipants)
      setIsInitialized(true)
    }
  }, [externalParticipants, setParticipants, isInitialized])
  
  React.useEffect(() => {
    if (isInitialized) {
      onParticipantsChange?.(participants)
    }
  }, [participants, onParticipantsChange, isInitialized])

  // Обработчики
  const handleAddArtist = React.useCallback(() => {
    const newParticipant: ArtistCredit = {
      id: `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      displayName: '',
      role: 'MainArtist',
      sequence: participants.length + 1
    }
    addParticipant(newParticipant)
  }, [addParticipant, participants.length])

  const handleRemoveArtist = React.useCallback((index: number) => {
    removeParticipant(index)
  }, [removeParticipant])

  const handleEditParticipant = React.useCallback((index: number, participant: ArtistCredit) => {
    setEditingParticipant({ index, participant })
  }, [])

  const handleSaveParticipant = React.useCallback((updatedParticipant: any) => {
    if (editingParticipant) {
      Object.keys(updatedParticipant).forEach(key => {
        updateParticipant(editingParticipant.index, key, updatedParticipant[key])
      })
    }
    setEditingParticipant(null)
  }, [editingParticipant, updateParticipant])

  const handleLocalInputChange = React.useCallback((field: string, value: any) => {
    if (field === 'variousArtists') {
      setVariousArtists(value)
    }
    onInputChange(field, value)
  }, [onInputChange])

  // DnD обработчики
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = participants.findIndex(p => (p.id || `participant-${participants.indexOf(p)}`) === active.id)
      const newIndex = participants.findIndex(p => (p.id || `participant-${participants.indexOf(p)}`) === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        moveParticipant(oldIndex, newIndex)
      }
    }

    setActiveId(null)
  }

  const formData = React.useMemo(() => ({
    variousArtists: variousArtists
  }), [variousArtists])

  // Находим перетаскиваемый участник для DragOverlay
  const activeParticipant = activeId ? participants.find(p => (p.id || `participant-${participants.indexOf(p)}`) === activeId) : null
  const activeIndex = activeParticipant ? participants.indexOf(activeParticipant) : -1

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Участники</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Укажите всех участников релиза и их роли. Перетащите для изменения порядка.
        </p>
      </div>

      {/* DnD контекст */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={participants.map(p => p.id || `participant-${participants.indexOf(p)}`)}
          strategy={verticalListSortingStrategy}
        >
          {/* Список карточек участников */}
          <div className="space-y-3">
            {participants.map((participant, index) => {
              const isLastMainArtist = participant.role === 'MainArtist' && 
                participants.filter(p => p.role === 'MainArtist').length === 1

              return (
                <SortableParticipantCard
                  key={participant.id || `participant-${index}`}
                  participant={participant}
                  index={index}
                  onUpdate={updateParticipant}
                  onRemove={handleRemoveArtist}
                  onEdit={handleEditParticipant}
                  isLastMainArtist={isLastMainArtist}
                />
              )
            })}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeParticipant && (
            <ParticipantDragOverlay 
              participant={activeParticipant} 
              index={activeIndex}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Кнопка добавления участника */}
      <Button
        onClick={handleAddArtist}
        variant="outline"
        className="w-full h-12 flex items-center justify-center gap-2 border-dashed border-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200"
      >
        <Plus className="h-5 w-5" />
        <span className="font-medium">Добавить участника</span>
      </Button>

      {/* Превью участников */}
      {participants.length > 0 && (
        <ParticipantsPreviewMobile 
          participants={participants} 
          formData={formData}
          onInputChange={handleLocalInputChange}
        />
      )}

      {/* Ошибки валидации */}
      {errors.participants && (
        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex items-center gap-2 text-destructive">
            <X className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{errors.participants}</span>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {editingParticipant && (
        <CreateParticipantModalResponsive
          isOpen={!!editingParticipant}
          onClose={() => setEditingParticipant(null)}
          onCreateParticipant={handleSaveParticipant}
          initialDisplayName={editingParticipant.participant.displayName || ''}
          initialData={editingParticipant.participant}
          mode="edit"
        />
      )}
    </div>
  )
}