'use client'

import React from 'react'
import { ParticipantsSection } from './ParticipantsSection'
import type { ParticipantsSectionProps } from '../types/participant.types'

export function ParticipantsSectionResponsive(props: ParticipantsSectionProps) {
  // SSR-safe: всегда используем один компонент, адаптивность через CSS
  // Это полностью устраняет hydration mismatch
  return <ParticipantsSection {...props} />
}