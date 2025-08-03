import { useState, useCallback } from 'react'
import { ReleaseFormData, Release } from '@/types/ddex-release'
import type { TrackFileItem } from '@/widgets/track-collection-manager'
import type { FileItem } from '@/widgets/artwork-manager'

export function useReleaseForm() {
  const [activeTab, setActiveTab] = useState('basic')
  const [validationOpen, setValidationOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)


  // Состояние формы
  const [formData, setFormData] = useState<ReleaseFormData>({
    releaseId: '',
    title: '',
    subtitle: '',
    releaseType: '',
    variousArtists: false,
    releaseDate: '',
    recordingYear: '',
    originalReleaseDate: '',
    genre: '',
    subGenre: '',
    parentalAdvisory: '',
    label: '',
    upc: '',
    artists: [{
      id: crypto.randomUUID(),
      displayName: '',
      role: 'MainArtist',
      sequence: 1
    }],
    copyright: [],
    notes: ''
  })

  // Файлы
  const [coverArt, setCoverArt] = useState<FileItem[]>([])
  const [audioFiles, setAudioFiles] = useState<TrackFileItem[]>([])

  // Ошибки валидации
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Очистка ошибки при изменении (БЕЗ зависимости от errors)
    setErrors(prev => {
      if (prev[field]) {
        const { [field]: removed, ...rest } = prev
        return rest
      }
      return prev
    })
  }, [])

  const updateArtist = useCallback((index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      artists: prev.artists.map((artist, i) =>
        i === index ? { ...artist, [field]: value } : artist
      )
    }))
  }, [])

  const addArtist = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      artists: [...prev.artists, {
        id: crypto.randomUUID(),
        displayName: '',
        role: 'MainArtist',
        sequence: prev.artists.length + 1
      }]
    }))
  }, [])

  const removeArtist = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      artists: prev.artists.filter((_, i) => i !== index)
    }))
  }, [])

  const moveArtist = useCallback((fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      if (fromIndex < 0 || fromIndex >= prev.artists.length) return prev
      if (toIndex < 0 || toIndex >= prev.artists.length) return prev
      if (fromIndex === toIndex) return prev

      const newArtists = [...prev.artists]
      const draggedArtist = newArtists[fromIndex]
      newArtists.splice(fromIndex, 1)
      newArtists.splice(toIndex, 0, draggedArtist)
      return { ...prev, artists: newArtists }
    })
  }, [])



  // Валидация (оптимизированная для предотвращения циклов)
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
  }, [formData.title, formData.artists, coverArt.length])

  const getValidationProgress = useCallback(() => {
    const requiredFields = [
      formData.title,
      formData.artists[0]?.displayName,
      coverArt.length > 0 ? 'cover' : ''
    ]
    
    const filledFields = requiredFields.filter(field => field).length
    return Math.round((filledFields / requiredFields.length) * 100)
  }, [formData.title, formData.artists, coverArt.length])

  // Проверяем, есть ли изменения в форме (оптимизированная версия)
  const hasFormChanges = useCallback(() => {
    return (
      formData.title.trim() !== '' ||
      (formData.subtitle && formData.subtitle.trim() !== '') ||
      formData.releaseType !== '' ||
      formData.variousArtists !== false ||
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
  }, [
    formData.title, formData.subtitle, formData.releaseType, formData.variousArtists,
    formData.releaseDate, formData.recordingYear, formData.originalReleaseDate,
    formData.genre, formData.subGenre, formData.label, formData.upc, formData.notes,
    formData.artists.length, coverArt.length, audioFiles.length
  ])

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
    validateForm,
    handleSubmit
  }
} 