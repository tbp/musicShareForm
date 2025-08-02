'use client'

import React from 'react'
import type { ParticipantRow } from '../types/participant.types'
import { ParticipantsDataTable } from './ParticipantsTable/data-table'

interface ParticipantsTableWrapperProps {
  data: ParticipantRow[]
  columns: any[]
  onMoveRow: (activeIndex: number, overIndex: number) => void
  onAddParticipant?: () => void
}

export default function ParticipantsTableWrapper({
  data,
  columns,
  onMoveRow,
  onAddParticipant
}: ParticipantsTableWrapperProps) {
  return (
    <ParticipantsDataTable
      data={data}
      columns={columns}
      onMove={onMoveRow}
      onAddParticipant={onAddParticipant}
    />
  )
}