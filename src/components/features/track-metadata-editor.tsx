'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Music, Hash, Settings, Users2, FileText, Upload } from 'lucide-react'
import { TrackFormData, Contributor, LyricFile } from '@/types/ddex-release'

interface TrackMetadataEditorProps {
  trackData: TrackFormData
  trackNumber: number
  fileName: string
  onSave: (data: TrackFormData) => void
  onClose: () => void
}

export function TrackMetadataEditor({ 
  trackData, 
  trackNumber, 
  fileName, 
  onSave, 
  onClose 
}: TrackMetadataEditorProps) {
  const [formData, setFormData] = useState<TrackFormData>(trackData)

  const handleInputChange = (field: keyof TrackFormData, value: string | number | Contributor[] | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addContributor = () => {
    setFormData(prev => ({
      ...prev,
      contributors: [...prev.contributors, { name: '', role: 'Composer' }]
    }))
  }

  const updateContributor = (index: number, field: keyof Contributor, value: string) => {
    setFormData(prev => ({
      ...prev,
      contributors: prev.contributors.map((contributor, i) => 
        i === index ? { ...contributor, [field]: value } : contributor
      )
    }))
  }

  const removeContributor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contributors: prev.contributors.filter((_, i) => i !== index)
    }))
  }

  const handleLyricFileUpload = (e: React.ChangeEvent<HTMLInputElement>, format: LyricFile['format']) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newLyricFile: LyricFile = {
      format,
      uri: URL.createObjectURL(file) as `https://${string}` // In real app, upload to cloud
    }

    setFormData(prev => ({
      ...prev,
      lyricFiles: [
        ...(prev.lyricFiles || []).filter(lf => lf.format !== format),
        newLyricFile
      ]
    }))
  }

  const removeLyricFile = (format: LyricFile['format']) => {
    setFormData(prev => ({
      ...prev,
      lyricFiles: (prev.lyricFiles || []).filter(lf => lf.format !== format)
    }))
  }

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="professional-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-foreground" />
            <div>
              <h2 className="text-lg font-semibold text-heading">
                Track #{trackNumber} Metadata
              </h2>
              <p className="text-sm text-muted">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-medium text-heading">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Track Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="form-input w-full"
                  placeholder="Track title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ISRC
                </label>
                <input
                  type="text"
                  value={formData.isrc || ''}
                  onChange={(e) => handleInputChange('isrc', e.target.value)}
                  className="form-input w-full"
                  placeholder="XXAAA2412345 (auto-generated if empty)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Language *
                </label>
                <input
                  type="text"
                  required
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  className="form-input w-full"
                  placeholder="Русский, English, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Track Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.trackNumber}
                  onChange={(e) => handleInputChange('trackNumber', parseInt(e.target.value))}
                  className="form-input w-full"
                />
              </div>
            </div>
          </section>

          {/* Technical Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-medium text-heading">Technical Information</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  BPM
                </label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={formData.bpm || ''}
                  onChange={(e) => handleInputChange('bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="form-input w-full"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sample Rate
                </label>
                <select
                  value={formData.sampleRate || ''}
                  onChange={(e) => handleInputChange('sampleRate', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="form-input w-full"
                >
                  <option value="">Auto</option>
                  <option value="44100">44.1 kHz</option>
                  <option value="48000">48 kHz</option>
                  <option value="88200">88.2 kHz</option>
                  <option value="96000">96 kHz</option>
                  <option value="192000">192 kHz</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bit Depth
                </label>
                <select
                  value={formData.bitDepth || ''}
                  onChange={(e) => handleInputChange('bitDepth', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="form-input w-full"
                >
                  <option value="">Auto</option>
                  <option value="16">16-bit</option>
                  <option value="24">24-bit</option>
                  <option value="32">32-bit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Channels
                </label>
                <select
                  value={formData.channels || ''}
                  onChange={(e) => handleInputChange('channels', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="form-input w-full"
                >
                  <option value="">Auto</option>
                  <option value="1">Mono</option>
                  <option value="2">Stereo</option>
                  <option value="6">5.1</option>
                </select>
              </div>
            </div>
          </section>

          {/* Contributors */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-base font-medium text-heading">Contributors</h3>
              </div>
              <button
                type="button"
                onClick={addContributor}
                className="btn-secondary text-sm py-2 px-3 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Contributor
              </button>
            </div>

            <div className="space-y-3">
              {formData.contributors.map((contributor, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={contributor.name}
                      onChange={(e) => updateContributor(index, 'name', e.target.value)}
                      className="form-input w-full"
                      placeholder="Contributor name"
                    />
                  </div>
                  
                  <div className="w-40">
                    <select
                      value={contributor.role}
                      onChange={(e) => updateContributor(index, 'role', e.target.value)}
                      className="form-input w-full"
                    >
                      <option value="Composer">Composer</option>
                      <option value="Lyricist">Lyricist</option>
                      <option value="Producer">Producer</option>
                      <option value="Arranger">Arranger</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeContributor(index)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.contributors.length === 0 && (
                <div className="text-center py-8 text-muted">
                  <Users2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p>No contributors added yet</p>
                  <p className="text-sm">Add composers, lyricists, producers, and arrangers</p>
                </div>
              )}
            </div>
          </section>

          {/* Lyrics Files */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-base font-medium text-heading">Lyrics Files</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['txt', 'lrc', 'ttml'] as const).map((format) => {
                const existingFile = formData.lyricFiles?.find(lf => lf.format === format)
                return (
                  <div key={format} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm uppercase text-foreground">
                        {format.toUpperCase()}
                      </h4>
                      {existingFile && (
                        <button
                          type="button"
                          onClick={() => removeLyricFile(format)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    
                    {existingFile ? (
                      <div className="text-center py-4">
                        <FileText className="w-8 h-8 text-success mx-auto mb-2" />
                        <p className="text-sm text-success font-medium">Uploaded</p>
                        <p className="text-xs text-muted">
                          {format === 'txt' && 'Plain text lyrics'}
                          {format === 'lrc' && 'Synchronized lyrics'}
                          {format === 'ttml' && 'Timed text markup'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <input
                          type="file"
                          accept={`.${format}`}
                          onChange={(e) => handleLyricFileUpload(e, format)}
                          className="hidden"
                          id={`lyrics-${format}`}
                        />
                        <label
                          htmlFor={`lyrics-${format}`}
                          className="cursor-pointer block"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted mb-1">Upload {format.toUpperCase()}</p>
                          <p className="text-xs text-muted">
                            {format === 'txt' && 'Plain text lyrics'}
                            {format === 'lrc' && 'Synchronized lyrics'}
                            {format === 'ttml' && 'Timed text markup'}
                          </p>
                        </label>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            <p className="text-xs text-muted mt-3">
              Upload lyrics in different formats. TXT for plain text, LRC for synchronized lyrics with timestamps, 
              TTML for advanced timed text markup with styling.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            Save Track Metadata
          </button>
        </div>
      </div>
    </div>
  )
} 