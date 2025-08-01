'use client'

import React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { GripVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onMove: (fromIndex: number, toIndex: number) => void
}

// Контекст для drag handle props
const DragHandleContext = React.createContext<{
  attributes?: any
  listeners?: any
} | null>(null)

// Компонент для draggable строки
function DraggableRow<TData>({ 
  row, 
  children,
  isActive = false,
  className
}: { 
  row: any
  children: React.ReactNode
  isActive?: boolean
  className?: string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
  } = useSortable({
    id: row.original.id,
  })

  return (
    <DragHandleContext.Provider value={{ attributes, listeners }}>
      <TableRow
        ref={setNodeRef}
        style={isActive ? { opacity: 0.3 } : {}}
        data-state={row.getIsSelected() && "selected"}
        className={cn(
          "transition-all duration-200",
          isActive && "opacity-30",
          className
        )}
      >
        {children}
      </TableRow>
    </DragHandleContext.Provider>
  )
}

// Экспорт контекста для drag handle
export { DragHandleContext }



// Компонент превью для перетаскиваемого элемента
interface DragPreviewProps {
  item: any
  columns: any[]
}

function DragPreview({ item, columns }: DragPreviewProps) {
  return (
    <div className="bg-background border border-primary/50 rounded-lg shadow-xl ring-2 ring-primary/20 transform rotate-1 scale-105 opacity-95">
      <table className="w-full caption-bottom text-sm" style={{ tableLayout: 'fixed' }}>
        <tbody>
          <TableRow className="hover:bg-transparent border-none bg-primary/5">
            {columns.map((column, index) => {
              const cellContent = (() => {
                switch (column.accessorKey || column.id) {
                  case 'drag':
                    return (
                      <div className="flex items-center justify-center h-14 px-2">
                        <GripVertical className="h-4 w-4 text-primary" />
                      </div>
                    )
                  case 'displayName':
                    return (
                      <div className="flex items-center gap-2 px-2">
                        <span className="font-medium text-foreground">
                          {item.displayName || 'Участник'}
                        </span>
                      </div>
                    )
                  case 'role':
                    return (
                      <div className="px-2">
                        <span className="text-sm text-muted-foreground bg-accent px-2 py-1 rounded">
                          {item.role || 'Роль'}
                        </span>
                      </div>
                    )
                  case 'copyrightShare':
                  case 'relatedRightsShare':
                    return (
                      <div className="px-2">
                        <span className="text-sm text-muted-foreground">
                          {item[column.accessorKey] || 0}%
                        </span>
                      </div>
                    )
                  case 'actions':
                    return (
                      <div className="flex justify-center px-2">
                        <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">•••</span>
                        </div>
                      </div>
                    )
                  default:
                    return (
                      <div className="px-2">
                        <span className="text-muted-foreground text-xs">•••</span>
                      </div>
                    )
                }
              })()

              return (
                <TableCell 
                  key={column.id || index}
                  style={{ width: getColumnWidth(column) }}
                  className="h-14 py-2"
                >
                  {cellContent}
                </TableCell>
              )
            })}
          </TableRow>
        </tbody>
      </table>
    </div>
  )
}

// Вспомогательная функция для получения ширины колонки
function getColumnWidth(column: any) {
  if (column.size) return `${column.size}px`
  if (column.id === 'drag') return '40px'
  if (column.accessorKey === 'displayName') return '200px'
  if (column.accessorKey === 'copyrightShare' || column.accessorKey === 'relatedRightsShare') return '65px'
  if (column.id === 'actions') return '60px'
  return 'auto'
}

export function ParticipantsDataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  onMove,
}: DataTableProps<TData, TValue>) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [overId, setOverId] = React.useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Чуть увеличим для предотвращения случайного drag
        delay: 50, // Уменьшим задержку для лучшей отзывчивости
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    defaultColumn: {
      minSize: 50,
      maxSize: 1000,
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    setOverId(null)

    if (active.id !== over?.id && over?.id) {
      const oldIndex = data.findIndex(item => item.id === active.id)
      const newIndex = data.findIndex(item => item.id === over?.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onMove(oldIndex, newIndex)
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverId(null)
  }

  const activeItem = React.useMemo(() => 
    activeId ? data.find(item => item.id === activeId) : null,
    [activeId, data]
  )

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        modifiers={[restrictToVerticalAxis]}
      >
      <div className="rounded-md border">
        <div className="relative w-full">
          <table className="w-full caption-bottom text-sm" style={{ tableLayout: 'fixed' }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id} 
                      style={{ width: header.getSize() }}
                      className="h-12"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <SortableContext 
              items={data.map(item => item.id)} 
              strategy={verticalListSortingStrategy}
            >
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row, index) => {
                  const isActive = activeId === row.original.id
                  const isOver = overId === row.original.id
                  
                  return (
                    <DraggableRow 
                      key={row.id}
                      row={row} 
                      isActive={isActive}
                      className={cn(
                        isOver && !isActive && "ring-2 ring-primary/50 bg-primary/5 transform scale-[1.02] transition-all duration-200"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell 
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="h-14 py-2"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </DraggableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Участники не добавлены.
                  </TableCell>
                </TableRow>
              )}
            </SortableContext>
          </TableBody>
          </table>
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'ease-out'
        }}
      >
        {activeItem ? (
          <DragPreview item={activeItem} columns={columns} />
        ) : null}
      </DragOverlay>

      </DndContext>
    </div>
  )
}