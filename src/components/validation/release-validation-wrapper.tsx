'use client'

import { ValidationModal } from '@/widgets/release-validation-dashboard/components/ValidationModal'
import { useReleaseFormContext } from '@/contexts/release-form-context'
import { useMemo } from 'react'

export function ReleaseValidationWrapper() {
  const { 
    validationOpen, 
    setValidationOpen, 
    validationProgress,
    formData 
  } = useReleaseFormContext()

  // Создаем требования валидации на основе данных формы
  const requirements = useMemo(() => [
    {
      id: 'basic-info',
      title: 'Основная информация',
      items: [
        { name: 'Название релиза', completed: !!formData.title.trim() },
        { name: 'Жанр', completed: !!formData.genre },
        { name: 'Тип контента', completed: !!formData.parentalAdvisory },
      ]
    },
    {
      id: 'participants',
      title: 'Участники',
      items: [
        { name: 'Основной исполнитель', completed: formData.artists.some(artist => artist.displayName.trim()) },
      ]
    }
  ], [formData])

  const totalItems = requirements.reduce((acc, req) => acc + req.items.length, 0)
  const completedItems = requirements.reduce((acc, req) => 
    acc + req.items.filter(item => item.completed).length, 0
  )

  return (
    <ValidationModal
      isOpen={validationOpen}
      onClose={() => setValidationOpen(false)}
      requirements={requirements}
      completionPercentage={validationProgress}
      completedItems={completedItems}
      totalItems={totalItems}
    />
  )
}