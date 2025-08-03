'use client'

import React from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CreateParticipantModal } from './CreateParticipantModal'
import { CreateParticipantModalMobile } from './CreateParticipantModalMobile'
import type { CreateParticipantModalProps } from '../types/participant.types'

export function CreateParticipantModalResponsive(props: CreateParticipantModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  if (isMobile) {
    return <CreateParticipantModalMobile {...props} />
  }
  
  return <CreateParticipantModal {...props} />
}