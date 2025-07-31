'use client'

import React from 'react'
import { ParticipantsDataTable } from '@/components/release-form/participants-table'
import { ParticipantRow } from '@/components/release-form/participants-table'

interface ParticipantsTableWrapperProps {
  data: ParticipantRow[]
  columns: any[]
  onMoveRow: (activeIndex: number, overIndex: number) => void
}

export default function ParticipantsTableWrapper({
  data,
  columns,
  onMoveRow
}: ParticipantsTableWrapperProps) {
  return (
    <ParticipantsDataTable
      data={data}
      columns={columns}
      onMove={onMoveRow}
    />
  )
}