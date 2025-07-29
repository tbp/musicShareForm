'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

interface SearchSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export function SearchSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  className = ''
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string } | null>(
    options.find(opt => opt.value === value) || null
  )
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const option = options.find(opt => opt.value === value)
    setSelectedOption(option || null)
  }, [value, options])

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (option: { value: string; label: string }) => {
    setSelectedOption(option)
    onChange(option.value)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedOption(null)
    onChange('')
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div className={`relative ${className}`}>
      <div
        ref={dropdownRef}
        className="relative"
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full bg-background border border-border rounded-lg px-4 py-4 pt-6 text-left text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground transition-all peer"
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
              {selectedOption ? selectedOption.label : placeholder || 'Выберите...'}
            </span>
            <div className="flex items-center gap-2">
              {selectedOption && (
                <div
                  onClick={handleClear}
                  className="p-1 hover:bg-muted rounded cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </div>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>
        
        <label className="absolute left-4 top-2 text-xs font-medium text-muted-foreground peer-focus:text-foreground transition-colors">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors ${
                      option.value === value ? 'bg-muted text-foreground' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-muted-foreground text-sm">
                  Ничего не найдено
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 