import { useState, useCallback, useMemo } from 'react'
import type { ValidationRequirement } from '../types/validation.types'

export function useValidation(initialRequirements: ValidationRequirement[] = []) {
  const [requirements, setRequirements] = useState<ValidationRequirement[]>(initialRequirements)
  const [isOpen, setIsOpen] = useState(false)

  // Расчет прогресса валидации
  const validationStats = useMemo(() => {
    const allItems = requirements.flatMap(req => req.items)
    const completedItems = allItems.filter(item => item.completed).length
    const totalItems = allItems.length
    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    return {
      completedItems,
      totalItems,
      completionPercentage,
      isComplete: completionPercentage === 100
    }
  }, [requirements])

  // Обновление статуса элемента
  const updateItemStatus = useCallback((requirementId: string, itemName: string, completed: boolean) => {
    setRequirements(prev => prev.map(req => 
      req.id === requirementId 
        ? {
            ...req,
            items: req.items.map(item => 
              item.name === itemName ? { ...item, completed } : item
            )
          }
        : req
    ))
  }, [])

  // Обновление требований
  const updateRequirements = useCallback((newRequirements: ValidationRequirement[]) => {
    setRequirements(newRequirements)
  }, [])

  // Открытие/закрытие модала
  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])

  return {
    // Состояние
    requirements,
    isOpen,
    ...validationStats,
    
    // Действия
    updateItemStatus,
    updateRequirements,
    openModal,
    closeModal
  }
}