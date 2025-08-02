'use client'

import React from 'react'
import { GripVertical, HelpCircle, Trash2 } from 'lucide-react'
import { ColumnDef } from '@tanstack/react-table'
import { PARTICIPANT_ROLES } from '../../constants/participantRoles'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { NumberInput } from '@/components/ui/number-input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import type { ParticipantRow } from '../../types/participant.types'
import { ParticipantAutocomplete } from '../ParticipantAutocomplete'
import { DragHandleContext } from './data-table'

// Компонент для ячейки с drag handle
function DragHandleCell() {
  const dragHandle = React.useContext(DragHandleContext)
  
  return (
    <div 
      className="flex items-center justify-center cursor-grab active:cursor-grabbing h-14 px-2 touch-none select-none"
      {...dragHandle?.listeners}
      {...dragHandle?.attributes}
      style={{ touchAction: 'none' }}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors pointer-events-none" />
    </div>
  )
}

// Компонент для ячейки с автокомплитом участника (мемоизированный с кастомным comparator)
const ParticipantNameCell = React.memo(function ParticipantNameCell({ 
  participant, 
  index, 
  onUpdate, 
  onEdit 
}: { 
  participant: ParticipantRow
  index: number
  onUpdate: (index: number, field: string, value: unknown) => void
  onEdit?: (index: number, participant: ParticipantRow) => void
}) {
  // Стабильная иконка роли
  const RoleIcon = React.useMemo(() => {
    const roleInfo = PARTICIPANT_ROLES[participant.role as keyof typeof PARTICIPANT_ROLES]
    return roleInfo?.icon || null
  }, [participant.role])

  const handleUpdate = React.useCallback((value: string) => {
    onUpdate(index, 'displayName', value)
  }, [onUpdate, index])

  const handleEdit = React.useCallback((participant: any) => {
    if (onEdit) {
      onEdit(index, participant as ParticipantRow)
    }
  }, [onEdit, index])

  return (
    <div data-row-index={index}>
      <ParticipantAutocomplete
        icon={RoleIcon}
        placeholder="Введите имя участника"
        value={participant.displayName}
        onChange={handleUpdate}
        onEditParticipant={onEdit ? handleEdit : undefined}
        showValidationError={true}
        className="h-10"
      />
    </div>
  )
}, (prevProps, nextProps) => {
  // Кастомный comparator: сравниваем только важные поля, игнорируем функции
  return (
    prevProps.participant.id === nextProps.participant.id &&
    prevProps.participant.displayName === nextProps.participant.displayName &&
    prevProps.participant.role === nextProps.participant.role &&
    prevProps.index === nextProps.index
    // НЕ сравниваем onUpdate и onEdit - они всегда новые, но логически те же
  )
})

// Компонент для ячейки с ролью
function RoleCell({ 
  participant, 
  index, 
  onUpdate, 
  isLastMainArtist 
}: { 
  participant: ParticipantRow
  index: number
  onUpdate: (index: number, field: string, value: unknown) => void
  isLastMainArtist: boolean
}) {
  const roleOptions = Object.entries(PARTICIPANT_ROLES).map(([key, info]: [string, { displayName: string; icon: any }]) => ({
    value: key,
    label: info.displayName
  }))

  return (
    <div title={isLastMainArtist ? "Нельзя изменить роль последнего основного исполнителя" : ""}>
      <SearchableSelect
        value={participant.role}
        onValueChange={(value) => onUpdate(index, 'role', value)}
        options={roleOptions}
        placeholder="Выберите роль"
        className=""
        disabled={isLastMainArtist}
      />
    </div>
  )
}



export const createColumns = ({ 
  onUpdate, 
  onRemove,
  onEdit
}: {
  onUpdate: (index: number, field: string, value: unknown) => void
  onRemove: (index: number) => void
  onEdit?: (index: number, participant: ParticipantRow) => void
}): ColumnDef<ParticipantRow>[] => [
  {
    id: "drag",
    header: "",
    cell: () => <DragHandleCell />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "displayName",
    header: "Участник",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex(r => r.id === row.id)
      const participant = row.original
      
      return (
        <ParticipantNameCell
          participant={participant}
          index={index}
          onUpdate={onUpdate}
          onEdit={onEdit}
        />
      )
    },
    size: 200,
    enableResizing: false,
  },
  {
    accessorKey: "role",
    header: "Роль",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex(r => r.id === row.id)
      const participant = row.original
      // Блокируем редактирование роли только для последнего основного исполнителя
      const isLastMainArtist = participant.role === 'MainArtist' && 
        table.getRowModel().rows.filter(r => r.original.role === 'MainArtist').length === 1
      
      return (
        <RoleCell
          participant={participant}
          index={index}
          onUpdate={onUpdate}
          isLastMainArtist={isLastMainArtist}
        />
      )
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex(r => r.id === row.id)
      const participant = row.original
      const isLastMainArtist = participant.role === 'MainArtist' && 
        table.getRowModel().rows.filter(r => r.original.role === 'MainArtist').length === 1
      
      const handleDelete = () => {
        onRemove(index)
      }

      return (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isLastMainArtist}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title={isLastMainArtist ? "Нельзя удалить последнего основного исполнителя" : "Удалить участника"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
]