'use client'

import React from 'react'
import { ColumnDef } from "@tanstack/react-table"
import { GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ParticipantAutocomplete } from "@/components/ui/participant-autocomplete"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { NumberInput } from "@/components/ui/number-input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { HelpCircle } from "lucide-react"
import { ArtistCredit } from "@/types/ddex-release"
import { PARTICIPANT_ROLES } from "@/constants/release-form"
import { DragHandleContext } from './data-table'


// Определение типа участника для таблицы
export type ParticipantRow = ArtistCredit & {
  id: string
}

interface ParticipantActionsProps {
  participant: ParticipantRow
  index: number
  isLastMainArtist: boolean
  onUpdate: (index: number, field: string, value: any) => void
  onRemove: (index: number) => void
}

export const createColumns = ({ 
  onUpdate, 
  onRemove,
  onEdit
}: {
  onUpdate: (index: number, field: string, value: any) => void
  onRemove: (index: number) => void
  onEdit?: (index: number, participant: any) => void
}): ColumnDef<ParticipantRow>[] => [
  {
    id: "drag",
    header: "",
    cell: ({ row }) => {
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
    },
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
      
      // Стабильная иконка роли
      const RoleIcon = React.useMemo(() => {
        const roleInfo = PARTICIPANT_ROLES[participant.role as keyof typeof PARTICIPANT_ROLES]
        return roleInfo?.icon || null
      }, [participant.role])

      const handleUpdate = React.useCallback((value: string) => {
        onUpdate(index, 'displayName', value)
      }, [onUpdate]) // index захватывается из замыкания, убираем из dependencies

      return (
        <ParticipantAutocomplete
          icon={RoleIcon}
          placeholder="Введите имя участника"
          value={participant.displayName}
          onChange={handleUpdate}
          onEditParticipant={onEdit ? React.useCallback((participant) => {
            onEdit(index, participant)
          }, [onEdit]) : undefined}
          showValidationError={true} // Показываем ошибки валидации
          className="h-10"
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
      
      const roleOptions = Object.entries(PARTICIPANT_ROLES).map(([key, info]: [string, any]) => ({
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
    },
  },
  {
    accessorKey: "copyrightShare",
    header: () => (
      <div className="flex items-center gap-2">
        Авторские
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              aria-label="Показать подсказку по авторским правам"
            >
              <HelpCircle className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80" side="top">
            <div className="space-y-3">
              <div className="font-medium text-foreground">
                Доля в авторских правах (Copyright)
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Для чего нужно:</strong> Определяет долю участника в доходах от воспроизведения композиции (стриминг, радио, публичные выступления).
                </p>
                <p>
                  <strong>Можно не заполнять:</strong> Если не планируете точное распределение доходов или участники договорились устно.
                </p>
                <p className="text-xs text-muted-foreground/80">
                  💡 Сумма долей всех участников в идеале должна составлять 100%
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex(r => r.id === row.id)
      const participant = row.original

      return (
        <NumberInput
          placeholder="0"
          value={participant.copyrightShare || 0}
          onChange={(value) => onUpdate(index, 'copyrightShare', value)}
          min={0}
          max={100}
          step={10}
          className="h-10"
        />
      )
    },
    size: 65,
    enableResizing: false,
  },
  {
    accessorKey: "relatedRightsShare",
    header: () => (
      <div className="flex items-center gap-2">
        Смежные
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
              aria-label="Показать подсказку по смежным правам"
            >
              <HelpCircle className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80" side="top">
            <div className="space-y-3">
              <div className="font-medium text-foreground">
                Доля в смежных правах (Related Rights)
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>Для чего нужно:</strong> Определяет долю участника в доходах от фонограммы (исполнительские права артистов, права продюсеров).
                </p>
                <p>
                  <strong>Можно не заполнять:</strong> Если участники не договаривались о точном распределении смежных прав.
                </p>
                <p className="text-xs text-muted-foreground/80">
                  💡 Смежные права отличаются от авторских и имеют свое распределение
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    ),
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex(r => r.id === row.id)
      const participant = row.original

      return (
        <NumberInput
          placeholder="0"
          value={participant.relatedRightsShare || 0}
          onChange={(value) => onUpdate(index, 'relatedRightsShare', value)}
          min={0}
          max={100}
          step={10}
          className="h-10"
        />
      )
    },
    size: 65,
    enableResizing: false,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const index = table.getRowModel().rows.findIndex(r => r.id === row.id)
      const participant = row.original
      
      // Более надежная проверка для блокировки удаления последнего основного исполнителя
      const allMainArtists = table.getRowModel().rows.filter(r => r.original.role === 'MainArtist')
      const isLastMainArtist = participant.role === 'MainArtist' && allMainArtists.length === 1

      const handleDelete = () => {
        if (!isLastMainArtist && index >= 0) {
          onRemove(index)
        }
      }

      return (
        <div className="flex justify-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={isLastMainArtist || index < 0}
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Удалить участника"
            title={isLastMainArtist ? "Нельзя удалить последнего основного исполнителя" : "Удалить участника"}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
]