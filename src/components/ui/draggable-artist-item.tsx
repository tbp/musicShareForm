'use client'

import { useState, useRef } from 'react'
import { GripVertical, Trash2, MoveUp, MoveDown } from 'lucide-react'
import { ArtistCredit } from '@/types/ddex-release'
import { FloatingLabelInput } from './floating-label-input'
import { SearchSelect } from './search-select'

interface DraggableArtistItemProps {
  artist: ArtistCredit
  index: number
  isFirst: boolean
  isLast: boolean
  onUpdate: (index: number, field: keyof ArtistCredit, value: string | number) => void
  onRemove: (index: number) => void
  onMove: (index: number, direction: 'up' | 'down') => void
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, index: number) => void
  isDragging: boolean
  draggedIndex: number | null
}

export function DraggableArtistItem({
  artist,
  index,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  draggedIndex
}: DraggableArtistItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver(e)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    onDrop(e, index)
  }

  return (
    <div
      ref={dragRef}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-muted/30 rounded-lg p-4 border border-border/30 transition-all duration-200 ${
        isDragging && draggedIndex === index 
          ? 'opacity-50 scale-95' 
          : isDragging && draggedIndex !== index 
            ? 'opacity-100' 
            : ''
      } ${isHovered ? 'border-foreground/30 shadow-sm' : ''}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Drag Handle */}
        <div className="flex items-center justify-center md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              #{index + 1}
            </span>
          </div>
        </div>

        {/* Artist Name */}
        <FloatingLabelInput
          label={index === 0 ? 'Основной исполнитель' : 'Исполнитель'}
          value={artist.displayName}
          onChange={(e) => onUpdate(index, 'displayName', e.target.value)}
          required={index === 0}
        />
        
        {/* Role */}
        <SearchSelect
          label="Роль"
          value={artist.role}
          onChange={(value) => onUpdate(index, 'role', value)}
          options={[
            { value: 'MainArtist', label: 'Основной исполнитель' },
            { value: 'FeaturedArtist', label: 'Приглашенный исполнитель' },
            { value: 'Remixer', label: 'Ремиксер' },
            { value: 'Producer', label: 'Продюсер' }
          ]}
        />
        
        {/* Share */}
        <FloatingLabelInput
          label="Доля %"
          type="number"
          value={artist.share.toString()}
          onChange={(e) => onUpdate(index, 'share', parseInt(e.target.value) || 0)}
        />
        
        {/* Actions */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <div className="flex gap-1">
              <button
                onClick={() => onMove(index, 'up')}
                disabled={isFirst}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Переместить вверх"
              >
                <MoveUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMove(index, 'down')}
                disabled={isLast}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Переместить вниз"
              >
                <MoveDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          {index > 0 && (
            <button
              onClick={() => onRemove(index)}
              className="p-2.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Удалить исполнителя"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 