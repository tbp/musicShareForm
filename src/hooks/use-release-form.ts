import { useState, useCallback } from 'react'
import { ReleaseFormData, ArtistCredit, Release } from '@/types/ddex-release'
import { FileItem } from '@/components/ui/enhanced-file-upload'

export function useReleaseForm() {
  const [activeTab, setActiveTab] = useState('basic')
  const [validationOpen, setValidationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Состояние формы
  const [formData, setFormData] = useState<ReleaseFormData>({
    releaseId: '',
    title: '',
    subtitle: '',
    releaseType: '',
    releaseDate: '',
    recordingYear: '',
    originalReleaseDate: '',
    genre: '',
    subGenre: '',
    parentalAdvisory: '',
    label: '',
    upc: '',
    artists: [],
    copyright: [],
    notes: ''
  })

  // Файлы
  const [coverArt, setCoverArt] = useState<FileItem[]>([])
  const [audioFiles, setAudioFiles] = useState<FileItem[]>([])

  // Ошибки валидации
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = useCallback((field: keyof ReleaseFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очистка ошибки при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

  const updateArtist = (index: number, field: keyof ArtistCredit, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      artists: prev.artists.map((artist, i) =>
        i === index ? { ...artist, [field]: value } : artist
      )
    }))
  }

  const addArtist = () => {
    setFormData(prev => ({
      ...prev,
      artists: [...prev.artists, {
        displayName: '',
        role: 'MainArtist',
        share: 0,
        sequence: prev.artists.length + 1
      }]
    }))
  }

  const removeArtist = (index: number) => {
    setFormData(prev => ({
      ...prev,
      artists: prev.artists.filter((_, i) => i !== index)
    }))
  }

  const moveArtist = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= formData.artists.length) return

    setFormData(prev => {
      const newArtists = [...prev.artists]
      const temp = newArtists[index]
      newArtists[index] = newArtists[newIndex]
      newArtists[newIndex] = temp
      return { ...prev, artists: newArtists }
    })
  }

  // Drag & Drop для артистов
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    setFormData(prev => {
      const newArtists = [...prev.artists]
      const draggedArtist = newArtists[draggedIndex]
      newArtists.splice(draggedIndex, 1)
      newArtists.splice(dropIndex, 0, draggedArtist)
      return { ...prev, artists: newArtists }
    })
    setDraggedIndex(null)
  }

  // Валидация
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно для заполнения'
    }
    
    if (formData.artists.some(artist => !artist.displayName.trim())) {
      newErrors.artists = 'Все исполнители должны иметь отображаемое имя'
    }

    if (coverArt.length === 0) {
      newErrors.coverArt = 'Обложка обязательна для релиза'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, coverArt])

  const getValidationProgress = useCallback(() => {
    const requiredFields = [
      formData.title,
      formData.artists[0]?.displayName,
      coverArt.length > 0 ? 'cover' : ''
    ]
    
    const filledFields = requiredFields.filter(field => field).length
    return Math.round((filledFields / requiredFields.length) * 100)
  }, [formData, coverArt])

  // Проверяем, есть ли изменения в форме
  const hasFormChanges = useCallback(() => {
    return (
      formData.title.trim() !== '' ||
      (formData.subtitle && formData.subtitle.trim() !== '') ||
      formData.releaseType !== '' ||
      formData.releaseDate !== '' ||
      (formData.recordingYear && formData.recordingYear.trim() !== '') ||
      (formData.originalReleaseDate && formData.originalReleaseDate.trim() !== '') ||
      formData.genre !== '' ||
      (formData.subGenre && formData.subGenre !== '') ||
      formData.label.trim() !== '' ||
      (formData.upc && formData.upc.trim() !== '') ||
      (formData.notes && formData.notes.trim() !== '') ||
      formData.artists.length > 0 ||
      coverArt.length > 0 ||
      audioFiles.length > 0
    )
  }, [formData, coverArt, audioFiles])

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const release: Release = {
        releaseId: formData.releaseId || `UPC${Date.now()}`,
        title: formData.title,
        releaseType: (formData.releaseType || 'Single') as 'Single' | 'EP' | 'Album' | 'Compilation',
        releaseDate: formData.releaseDate as `${string}-${string}-${string}`,
        genre: formData.genre,
        subGenre: formData.subGenre,
        parentalAdvisory: (formData.parentalAdvisory || 'NotExplicit') as 'Explicit' | 'NotExplicit' | 'Edited',
        label: formData.label,
        artists: formData.artists,
        copyright: formData.copyright,
        coverArt: {
          uri: (coverArt[0]?.preview || 'https://example.com') as `https://${string}`,
          width: 3000,
          height: 3000,
          mimeType: (coverArt[0]?.file.type || 'image/jpeg') as 'image/jpeg' | 'image/png'
        },
        resources: audioFiles.map((f, index) => ({
          trackNumber: index + 1,
          isrc: `ISRC${Date.now()}${index}`
        }))
      }
      
      console.log('DDEX Release Object:', { release })
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Релиз успешно создан!')
    } catch (error) {
      console.error('Ошибка создания релиза:', error)
      alert('Не удалось создать релиз.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const validationProgress = getValidationProgress()
  const formHasChanges = hasFormChanges()

  return {
    // Состояние
    activeTab,
    setActiveTab,
    validationOpen,
    setValidationOpen,
    isSubmitting,
    draggedIndex,
    formData,
    coverArt,
    setCoverArt,
    audioFiles,
    setAudioFiles,
    errors,
    validationProgress,
    hasFormChanges: formHasChanges,

    // Обработчики
    handleInputChange,
    updateArtist,
    addArtist,
    removeArtist,
    moveArtist,
    handleDragStart,
    handleDragOver,
    handleDrop,
    validateForm,
    handleSubmit
  }
} 