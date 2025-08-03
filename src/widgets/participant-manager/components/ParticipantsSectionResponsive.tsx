'use client'

import React, { useState, useEffect } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ParticipantsSection } from './ParticipantsSection'
import { ParticipantsSectionMobile } from './ParticipantsSectionMobile'
import type { ParticipantsSectionProps } from '../types/participant.types'

export function ParticipantsSectionResponsive(props: ParticipantsSectionProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Пока не загрузился клиент, показываем десктопную версию
  if (!isClient) {
    return <ParticipantsSection {...props} />
  }
  
  if (isMobile) {
    return <ParticipantsSectionMobile {...props} />
  }
  
  return <ParticipantsSection {...props} />
}