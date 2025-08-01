'use client'

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'

import { Plus, AlertCircle, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchParticipants, ParticipantSuggestion } from '@/data/participants'
import { getPlatformInfo } from '@/lib/platforms'
import { ArtistPlatformsPopover } from '@/components/ui/artist-platforms-popover'
import { CreateParticipantModal } from '@/components/ui/create-participant-modal'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { usePlatformIcon } from '@/components/shared/icons'

interface ParticipantAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectParticipant?: (participant: ParticipantSuggestion) => void
  onEditParticipant?: (participant: ParticipantSuggestion) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  icon?: React.ComponentType<any>
  showValidationError?: boolean
}

export function ParticipantAutocomplete({
  value,
  onChange,
  onSelectParticipant,
  onEditParticipant,
  placeholder = "Введите имя участника",
  className,
  disabled,
  icon: IconComponent,
  showValidationError = false
}: ParticipantAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantSuggestion | null>(null)
  const [hasValidationError, setHasValidationError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Мемоизируем поиск предложений
  const suggestions = useMemo(() => {
    if (value.length >= 2) {
      return searchParticipants(value.trim().toLowerCase())
    }
    return []
  }, [value])

  // Проверка валидности участника  
  const isValidParticipant = useMemo(() => {
    if (!value.trim()) return true // Пустое значение считается валидным
    
    // Если есть выбранный участник, он всегда валиден
    if (selectedParticipant) {
      return true
    }
    
    // Если нет selectedParticipant, проверяем есть ли точное совпадение в предложениях
    const exactMatch = suggestions.find(s => s.displayName === value)
    return !!exactMatch
  }, [value, selectedParticipant, suggestions])

  // Обработка изменения значения - ОТКРЫВАЕМ АВТОКОМПЛИТ ТОЛЬКО ЗДЕСЬ
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: открываем автокомплит только при реальном вводе пользователем
    if (newValue.length >= 2 && !disabled) {
      setIsOpen(true)
      setHighlightedIndex(0)
    } else {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
    
    // Очищаем ошибку валидации при вводе
    if (hasValidationError) {
      setHasValidationError(false)
    }
  }, [onChange, hasValidationError, disabled])

  // Обработка выбора предложения
  const handleSelectSuggestion = useCallback((suggestion: ParticipantSuggestion) => {
    // Устанавливаем состояния
    setSelectedParticipant(suggestion)
    setIsOpen(false)
    setHighlightedIndex(-1)
    setHasValidationError(false)
    
    // Обновляем value
    onChange(suggestion.displayName)
    onSelectParticipant?.(suggestion)
    
    // Убираем фокус для закрытия автокомплита
    setTimeout(() => inputRef.current?.blur(), 0)
  }, [onChange, onSelectParticipant])

  // Создание нового участника
  const handleCreateParticipant = useCallback((participant: ParticipantSuggestion) => {
    setSelectedParticipant(participant)
    setHasValidationError(false)
    setIsOpen(false)
    onChange(participant.displayName)
    onSelectParticipant?.(participant)
  }, [onChange, onSelectParticipant])

  // Управление selectedParticipant - очистка и восстановление
  useEffect(() => {
    if (selectedParticipant && value !== selectedParticipant.displayName) {
      // Очищаем если value изменился и не соответствует selectedParticipant
      setSelectedParticipant(null)
    } else if (!selectedParticipant && value.trim() && suggestions.length > 0) {
      // ИСПРАВЛЕНИЕ: восстанавливаем selectedParticipant если найден точный матч
      const exactMatch = suggestions.find(s => s.displayName === value)
      if (exactMatch) {
        setSelectedParticipant(exactMatch)
      }
    }
  }, [value, selectedParticipant, suggestions])

  // Автоскролл к выделенному элементу при навигации стрелками
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && dropdownRef.current) {
      const highlightedElement = dropdownRef.current.querySelector(`[data-index="${highlightedIndex}"]`)
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }
    }
  }, [highlightedIndex, isOpen])

  // Обработка клавиатуры
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (isOpen) {
          e.preventDefault()
          // Количество всех опций: предложения + опция создания
          const totalOptions = suggestions.length + (value.trim() ? 1 : 0)
          if (totalOptions > 0) {
            setHighlightedIndex(prev => 
              prev < totalOptions - 1 ? prev + 1 : prev
            )
          }
        }
        break
      case 'ArrowUp':
        if (isOpen) {
          e.preventDefault()
          const totalOptions = suggestions.length + (value.trim() ? 1 : 0)
          if (totalOptions > 0) {
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
          }
        }
        break
      case 'Enter':
        e.preventDefault()
        if (isOpen) {
          if (suggestions.length > 0) {
            // Если выделен элемент из предложений
            if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
              handleSelectSuggestion(suggestions[highlightedIndex])
            }
            // Если выделена кнопка "создать участника" (последний индекс)
            else if (highlightedIndex === suggestions.length) {
              setIsCreateModalOpen(true)
              setIsOpen(false)
            }
            // Если ничего не выделено, выбираем первый элемент
            else {
              handleSelectSuggestion(suggestions[0])
            }
          } else if (value.trim()) {
            // Нет предложений, открываем модалку создания
            setIsCreateModalOpen(true)
            setIsOpen(false)
          }
        } else if (value.trim() && !selectedParticipant && !isValidParticipant && showValidationError) {
          // Показываем ошибку валидации только если нет выбранного участника
          setHasValidationError(true)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }, [isOpen, suggestions, highlightedIndex, handleSelectSuggestion, value, selectedParticipant, isValidParticipant, showValidationError])

  // Обработка фокуса - открываем только если уже есть достаточно символов
  const handleFocus = useCallback((e: React.FocusEvent) => {
    if (value.length >= 2 && !disabled) {
      setIsOpen(true)
      setHighlightedIndex(0)
    }
  }, [value, disabled])

  // Обработка потери фокуса
  const handleBlur = useCallback((e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as Node
    if (!containerRef.current?.contains(relatedTarget)) {
      setIsOpen(false)
      setHighlightedIndex(-1)
      
      // Валидация при потере фокуса только если нет выбранного участника
      if (value.trim() && !selectedParticipant && !isValidParticipant) {
        if (showValidationError) {
          setHasValidationError(true)
        } else {
          // Очищаем невалидное значение если не показываем ошибки
          onChange('')
          setSelectedParticipant(null)
        }
      } else if (selectedParticipant) {
        // Если есть выбранный участник, очищаем возможные ошибки
        setHasValidationError(false)
      }
    }
  }, [showValidationError, value, selectedParticipant, isValidParticipant, onChange])

  // Обработчик клика вне компонента для закрытия автокомплита
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setHighlightedIndex(-1)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  return (
    <>
      <div ref={containerRef} className="relative">
        <div className="relative">
          {IconComponent && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              'peer w-full rounded-md border text-sm ring-offset-background transition-colors',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'h-10 px-3 py-2',
              IconComponent && 'pl-10',
              (selectedParticipant || onEditParticipant) && 'pr-12',
              hasValidationError && !selectedParticipant && 'pr-12',
              // Условные стили для валидации
              hasValidationError 
                ? 'border-destructive bg-destructive/5 focus-visible:ring-destructive' 
                : 'border-input bg-background',
              className
            )}
            autoComplete="off"
          />
          
          {/* Иконки платформ ИЛИ кнопка редактирования */}
          {selectedParticipant ? (
            // Если есть selectedParticipant - показываем платформы или кнопку редактирования
            selectedParticipant.platformLinks && selectedParticipant.platformLinks.length > 0 ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <ArtistPlatformsPopover 
                  participant={selectedParticipant}
                  onEdit={onEditParticipant ? () => onEditParticipant(selectedParticipant) : undefined}
                >
                  <div className="flex items-center gap-1 hover:bg-accent/50 rounded px-1 py-0.5 cursor-pointer transition-colors">
                    {selectedParticipant.platformLinks.slice(0, 3).map((link, index) => {
                      const PlatformIcon = usePlatformIcon(link.platform)
                      const platformInfo = getPlatformInfo(link.platform)
                      return (
                        <PlatformIcon
                          key={index}
                          size="sm"
                          title={platformInfo.name}
                          aria-label={platformInfo.name}
                        />
                      )
                    })}
                    {selectedParticipant.platformLinks.length > 3 && (
                      <span className="text-xs text-muted-foreground font-medium ml-0.5">
                        +{selectedParticipant.platformLinks.length - 3}
                      </span>
                    )}
                  </div>
                </ArtistPlatformsPopover>
              </div>
            ) : onEditParticipant ? (
              // Если нет платформ но есть onEdit - показываем кнопку редактирования
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditParticipant(selectedParticipant)}
                  className="h-6 w-6 p-0 hover:bg-accent"
                  title="Редактировать участника"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              </div>
            ) : null
          ) : (
            // Иконка ошибки валидации только если нет selectedParticipant
            hasValidationError && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      type="button"
                      className="flex items-center justify-center text-destructive hover:text-destructive/80 transition-colors p-0.5 rounded"
                      aria-label="Ошибка валидации"
                    >
                      <AlertCircle className="h-5 w-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3" side="top" align="end">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                        <p className="text-sm font-medium text-destructive">
                          Участник должен быть выбран из списка
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Введите минимум 2 символа, выберите из предложений или создайте нового участника
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )
          )}
        </div>

        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              <>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    data-index={index}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelectSuggestion(suggestion)
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      "px-4 py-3 cursor-pointer border-b border-border/50",
                      "hover:bg-accent/50 transition-colors",
                      highlightedIndex === index && "bg-accent"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">
                          {suggestion.displayName}
                        </div>
                        {suggestion.realName && (
                          <div className="text-xs text-muted-foreground">
                            {suggestion.realName}
                          </div>
                        )}
                        {suggestion.roles && suggestion.roles.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {suggestion.roles.join(', ')}
                          </div>
                        )}
                      </div>
                      
                      {/* Иконки платформ */}
                      {suggestion.platformLinks && suggestion.platformLinks.length > 0 && (
                        <div className="flex items-center gap-1 ml-3">
                          {suggestion.platformLinks.slice(0, 3).map((link, linkIndex) => {
                            const platformInfo = getPlatformInfo(link.platform)
                            const PlatformIcon = usePlatformIcon(link.platform)
                            return (
                              <PlatformIcon
                                key={linkIndex}
                                size="md"
                                className="opacity-60"
                                title={platformInfo.name}
                                aria-label={platformInfo.name}
                              />
                            )
                          })}
                          {suggestion.platformLinks.length > 3 && (
                            <span className="text-xs text-muted-foreground ml-1">
                              +{suggestion.platformLinks.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Разделитель и кнопка создания */}
                <div className="border-t border-border/50">
                  <div
                    data-index={suggestions.length}
                    onMouseDown={() => {
                      setIsCreateModalOpen(true)
                      setIsOpen(false)
                    }}
                    onMouseEnter={() => setHighlightedIndex(suggestions.length)}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors flex items-center gap-2",
                      "hover:bg-accent/50",
                      highlightedIndex === suggestions.length && "bg-accent"
                    )}
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    <span className="text-sm text-primary font-medium">
                      Создать участника &quot;{value}&quot;
                    </span>
                  </div>
                </div>
              </>
            ) : value.length >= 2 ? (
              /* Если нет результатов, показываем только кнопку создания */
              <div
                data-index={0}
                onMouseDown={() => {
                  setIsCreateModalOpen(true)
                  setIsOpen(false)
                }}
                onMouseEnter={() => setHighlightedIndex(0)}
                className={cn(
                  "px-4 py-3 cursor-pointer transition-colors flex items-center gap-2",
                  "hover:bg-accent/50",
                  highlightedIndex === 0 && "bg-accent"
                )}
              >
                <Plus className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  Создать участника &quot;{value}&quot;
                </span>
              </div>
            ) : null}
          </div>
        )}
        

      </div>

      {/* Модальное окно создания участника */}
      <CreateParticipantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateParticipant={handleCreateParticipant}
        initialDisplayName={value}
      />
    </>
  )
}