'use client'

import { useState } from 'react'
import { Music, X, Plus, Trash2, Upload, Clock, Hash, Globe, Users, FileText, ChevronUp, ChevronDown, Play } from 'lucide-react'
import { type FileWithMetadata } from '@/hooks/use-file-upload'
import { TrackFormData, Contributor, LyricFile } from '@/types/ddex-release'

interface StudioTimelineProps {
  files: FileWithMetadata[]
  onUpdateTrackMetadata: (id: string, metadata: TrackFormData) => void
  onRemoveFile: (id: string) => void
  onMoveTrack: (fromIndex: number, toIndex: number) => void
}

export function StudioTimeline({ files, onUpdateTrackMetadata, onRemoveFile, onMoveTrack }: StudioTimelineProps) {
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<{ trackId: string; field: string } | null>(null)

  const audioFiles = files.filter(f => f.type === 'audio' && !f.error)

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const toggleExpanded = (trackId: string) => {
    setExpandedTrack(expandedTrack === trackId ? null : trackId)
  }

  const startEditing = (trackId: string, field: string) => {
    setEditingField({ trackId, field })
  }

  const saveField = (trackId: string, field: string, value: string | number | undefined) => {
    const file = audioFiles.find(f => f.id === trackId)
    if (!file?.trackMetadata) return

    const updatedMetadata = { ...file.trackMetadata, [field]: value }
    onUpdateTrackMetadata(trackId, updatedMetadata)
    setEditingField(null)
  }

  const addContributor = (trackId: string) => {
    const file = audioFiles.find(f => f.id === trackId)
    if (!file?.trackMetadata) return

    const updatedMetadata = {
      ...file.trackMetadata,
      contributors: [...file.trackMetadata.contributors, { name: '', role: 'Composer' as const }]
    }
    onUpdateTrackMetadata(trackId, updatedMetadata)
  }

  const updateContributor = (trackId: string, index: number, field: keyof Contributor, value: string) => {
    const file = audioFiles.find(f => f.id === trackId)
    if (!file?.trackMetadata) return

    const updatedContributors = file.trackMetadata.contributors.map((c, i) => 
      i === index ? { ...c, [field]: value } : c
    )
    
    const updatedMetadata = { ...file.trackMetadata, contributors: updatedContributors }
    onUpdateTrackMetadata(trackId, updatedMetadata)
  }

  const removeContributor = (trackId: string, index: number) => {
    const file = audioFiles.find(f => f.id === trackId)
    if (!file?.trackMetadata) return

    const updatedContributors = file.trackMetadata.contributors.filter((_, i) => i !== index)
    const updatedMetadata = { ...file.trackMetadata, contributors: updatedContributors }
    onUpdateTrackMetadata(trackId, updatedMetadata)
  }

  const handleLyricUpload = (trackId: string, format: LyricFile['format'], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const audioFile = audioFiles.find(f => f.id === trackId)
    if (!audioFile?.trackMetadata) return

    const newLyricFile: LyricFile = {
      format,
      uri: URL.createObjectURL(file) as `https://${string}`
    }

    const updatedLyrics = [
      ...(audioFile.trackMetadata.lyricFiles || []).filter(lf => lf.format !== format),
      newLyricFile
    ]

    const updatedMetadata = { ...audioFile.trackMetadata, lyricFiles: updatedLyrics }
    onUpdateTrackMetadata(trackId, updatedMetadata)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      // Trigger file processing in parent through a custom event
      window.dispatchEvent(new CustomEvent('studio-files-selected', { 
        detail: selectedFiles 
      }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="text-center py-8 border-2 border-dashed border-border rounded-lg hover:border-muted-foreground transition-colors relative">
        <input
          type="file"
          multiple
          accept="audio/*"
          onChange={handleFileSelect}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <h3 className="text-base font-medium text-heading mb-1">
          {audioFiles.length === 0 ? 'Upload audio tracks' : 'Add more tracks'}
        </h3>
        <p className="text-sm text-muted">
          Drag & drop or click to select MP3, WAV, FLAC, M4A files
        </p>
      </div>

      {/* Timeline */}
      {audioFiles.length > 0 && (
        <div className="space-y-2">
          {audioFiles.map((file, index) => {
        const track = file.trackMetadata
        if (!track) return null

        const isExpanded = expandedTrack === file.id
        const hasLyrics = track.lyricFiles && track.lyricFiles.length > 0

        return (
          <div key={file.id} className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Track Header */}
            <div 
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => toggleExpanded(file.id)}
            >
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium">{index + 1}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-heading truncate">{track.title}</h3>
                  <span className="text-xs text-muted bg-muted/50 px-2 py-1 rounded">
                    {formatDuration(track.durationSeconds)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted mt-1">
                  <span>{track.language}</span>
                  {track.bpm && <span>{track.bpm} BPM</span>}
                  <span>{track.contributors.length} contributor{track.contributors.length !== 1 ? 's' : ''}</span>
                  {hasLyrics && <span className="text-success">✓ Lyrics</span>}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // Play track functionality will be added
                    console.log('Play track:', file.file.name)
                  }}
                  className="p-1.5 text-foreground hover:bg-muted rounded transition-colors"
                  title="Play track"
                >
                  <Play className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (index > 0) onMoveTrack(index, index - 1)
                  }}
                  disabled={index === 0}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-30"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (index < audioFiles.length - 1) onMoveTrack(index, index + 1)
                  }}
                  disabled={index === audioFiles.length - 1}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-30"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFile(file.id)
                  }}
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors"
                  title="Remove track"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-border p-4 space-y-4 bg-muted/20">
                {/* Basic Info Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted flex items-center gap-1 mb-1">
                      <Music className="w-3 h-3" />
                      Title
                    </label>
                    {editingField?.trackId === file.id && editingField?.field === 'title' ? (
                      <input
                        type="text"
                        value={track.title}
                        onChange={(e) => saveField(file.id, 'title', e.target.value)}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                        className="form-input text-sm w-full"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-sm font-medium cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onClick={() => startEditing(file.id, 'title')}
                      >
                        {track.title}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted flex items-center gap-1 mb-1">
                      <Globe className="w-3 h-3" />
                      Language
                    </label>
                    {editingField?.trackId === file.id && editingField?.field === 'language' ? (
                      <input
                        type="text"
                        value={track.language}
                        onChange={(e) => saveField(file.id, 'language', e.target.value)}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                        className="form-input text-sm w-full"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onClick={() => startEditing(file.id, 'language')}
                      >
                        {track.language}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted flex items-center gap-1 mb-1">
                      <Hash className="w-3 h-3" />
                      ISRC
                    </label>
                    {editingField?.trackId === file.id && editingField?.field === 'isrc' ? (
                      <input
                        type="text"
                        value={track.isrc || ''}
                        onChange={(e) => saveField(file.id, 'isrc', e.target.value)}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                        className="form-input text-sm w-full"
                        placeholder="Auto-generated"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onClick={() => startEditing(file.id, 'isrc')}
                      >
                        {track.isrc || 'Auto-generated'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-muted flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      BPM
                    </label>
                    {editingField?.trackId === file.id && editingField?.field === 'bpm' ? (
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={track.bpm || ''}
                        onChange={(e) => saveField(file.id, 'bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                        onBlur={() => setEditingField(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingField(null)}
                        className="form-input text-sm w-full"
                        placeholder="120"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                        onClick={() => startEditing(file.id, 'bpm')}
                      >
                        {track.bpm || 'Add BPM'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contributors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-muted flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Contributors
                    </label>
                    <button
                      onClick={() => addContributor(file.id)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {track.contributors.map((contributor, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={contributor.name}
                          onChange={(e) => updateContributor(file.id, idx, 'name', e.target.value)}
                          className="form-input text-sm flex-1"
                          placeholder="Contributor name"
                        />
                        <select
                          value={contributor.role}
                          onChange={(e) => updateContributor(file.id, idx, 'role', e.target.value)}
                          className="form-input text-sm w-28"
                        >
                          <option value="Composer">Composer</option>
                          <option value="Lyricist">Lyricist</option>
                          <option value="Producer">Producer</option>
                          <option value="Arranger">Arranger</option>
                        </select>
                        <button
                          onClick={() => removeContributor(file.id, idx)}
                          className="p-1 text-destructive hover:bg-destructive/10 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {track.contributors.length === 0 && (
                      <p className="text-xs text-muted italic">No contributors added</p>
                    )}
                  </div>
                </div>

                {/* Lyrics */}
                <div>
                  <label className="text-xs text-muted flex items-center gap-1 mb-2">
                    <FileText className="w-3 h-3" />
                    Lyrics Files
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {(['txt', 'lrc', 'ttml'] as const).map((format) => {
                      const hasFile = track.lyricFiles?.some(lf => lf.format === format)
                      return (
                        <div key={format} className="text-center">
                          {hasFile ? (
                            <div className="p-2 bg-success/10 border border-success/20 rounded">
                              <FileText className="w-4 h-4 text-success mx-auto mb-1" />
                              <div className="text-xs font-medium text-success">{format.toUpperCase()}</div>
                            </div>
                          ) : (
                            <div className="relative">
                              <input
                                type="file"
                                accept={`.${format}`}
                                onChange={(e) => handleLyricUpload(file.id, format, e)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className="p-2 border-2 border-dashed border-border rounded hover:border-muted-foreground transition-colors">
                                <Upload className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                                <div className="text-xs text-muted">{format.toUpperCase()}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
        </div>
      )}
    </div>
  )
} 