'use client'

import { useState } from 'react'
import { Music, FileText, Edit3, Save, X, Plus, Trash2, Upload } from 'lucide-react'
import { type FileWithMetadata } from '@/hooks/use-file-upload'
import { TrackFormData, Contributor, LyricFile } from '@/types/ddex-release'

interface CompactTrackListProps {
  files: FileWithMetadata[]
  onUpdateTrackMetadata: (id: string, metadata: TrackFormData) => void
  onRemoveFile: (id: string) => void
}

export function CompactTrackList({ files, onUpdateTrackMetadata, onRemoveFile }: CompactTrackListProps) {
  const [editingTrack, setEditingTrack] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<TrackFormData | null>(null)

  const audioFiles = files.filter(f => f.type === 'audio' && !f.error)

  const startEditing = (file: FileWithMetadata) => {
    if (!file.trackMetadata) return
    setEditingTrack(file.id)
    setEditForm({ ...file.trackMetadata })
  }

  const saveEditing = () => {
    if (!editingTrack || !editForm) return
    onUpdateTrackMetadata(editingTrack, editForm)
    setEditingTrack(null)
    setEditForm(null)
  }

  const cancelEditing = () => {
    setEditingTrack(null)
    setEditForm(null)
  }

  const updateEditForm = (field: keyof TrackFormData, value: string | number | Contributor[] | undefined) => {
    if (!editForm) return
    setEditForm((prev: TrackFormData | null) => prev ? { ...prev, [field]: value } : null)
  }

  const addContributor = () => {
    if (!editForm) return
    setEditForm((prev: TrackFormData | null) => prev ? {
      ...prev,
      contributors: [...prev.contributors, { name: '', role: 'Composer' }]
    } : null)
  }

  const updateContributor = (index: number, field: keyof Contributor, value: string) => {
    if (!editForm) return
    setEditForm((prev: TrackFormData | null) => prev ? {
      ...prev,
      contributors: prev.contributors.map((c: Contributor, i: number) => 
        i === index ? { ...c, [field]: value } : c
      )
    } : null)
  }

  const removeContributor = (index: number) => {
    if (!editForm) return
    setEditForm((prev: TrackFormData | null) => prev ? {
      ...prev,
      contributors: prev.contributors.filter((_: Contributor, i: number) => i !== index)
    } : null)
  }

  const handleLyricUpload = (format: LyricFile['format'], e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editForm) return

    const newLyricFile: LyricFile = {
      format,
      uri: URL.createObjectURL(file) as `https://${string}`
    }

    setEditForm((prev: TrackFormData | null) => prev ? {
      ...prev,
      lyricFiles: [
        ...(prev.lyricFiles || []).filter(lf => lf.format !== format),
        newLyricFile
      ]
    } : null)
  }

  const removeLyricFile = (format: LyricFile['format']) => {
    if (!editForm) return
    setEditForm((prev: TrackFormData | null) => prev ? {
      ...prev,
      lyricFiles: (prev.lyricFiles || []).filter(lf => lf.format !== format)
    } : null)
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      {audioFiles.map((file, index) => {
        const isEditing = editingTrack === file.id
        const track = isEditing ? editForm : file.trackMetadata

        if (!track) return null

        return (
          <div key={file.id} className="border border-border rounded-lg p-4 space-y-4">
            {/* Track Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-medium text-heading">
                    {isEditing ? (
                      <input
                        type="text"
                        value={track.title}
                        onChange={(e) => updateEditForm('title', e.target.value)}
                        className="form-input text-base font-medium w-64"
                        placeholder="Track title"
                      />
                    ) : (
                      track.title || file.file.name
                    )}
                  </h3>
                  <p className="text-sm text-muted">{file.file.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveEditing}
                      className="p-2 text-foreground hover:bg-muted rounded-lg"
                      title="Save changes"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-2 text-muted-foreground hover:bg-muted rounded-lg"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(file)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                      title="Edit track metadata"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                      title="Remove track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Track Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted block">Duration</span>
                <span className="font-medium">{formatDuration(track.durationSeconds)}</span>
              </div>
              <div>
                <span className="text-muted block">Language</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={track.language}
                    onChange={(e) => updateEditForm('language', e.target.value)}
                    className="form-input text-sm w-full"
                    placeholder="English, Русский..."
                  />
                ) : (
                  <span className="font-medium">{track.language}</span>
                )}
              </div>
              <div>
                <span className="text-muted block">ISRC</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={track.isrc || ''}
                    onChange={(e) => updateEditForm('isrc', e.target.value)}
                    className="form-input text-sm w-full"
                    placeholder="Auto-generated"
                  />
                ) : (
                  <span className="font-medium">{track.isrc || 'Auto-generated'}</span>
                )}
              </div>
              <div>
                <span className="text-muted block">BPM</span>
                {isEditing ? (
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={track.bpm || ''}
                    onChange={(e) => updateEditForm('bpm', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="form-input text-sm w-full"
                    placeholder="120"
                  />
                ) : (
                  <span className="font-medium">{track.bpm || 'N/A'}</span>
                )}
              </div>
            </div>

            {/* Contributors */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Contributors</span>
                {isEditing && (
                  <button
                    onClick={addContributor}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  {track.contributors.map((contributor, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={contributor.name}
                        onChange={(e) => updateContributor(idx, 'name', e.target.value)}
                        className="form-input text-sm flex-1"
                        placeholder="Name"
                      />
                      <select
                        value={contributor.role}
                        onChange={(e) => updateContributor(idx, 'role', e.target.value)}
                        className="form-input text-sm w-32"
                      >
                        <option value="Composer">Composer</option>
                        <option value="Lyricist">Lyricist</option>
                        <option value="Producer">Producer</option>
                        <option value="Arranger">Arranger</option>
                      </select>
                      <button
                        onClick={() => removeContributor(idx)}
                        className="p-1 text-destructive hover:bg-destructive/10 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {track.contributors.length === 0 && (
                    <p className="text-xs text-muted">No contributors added</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {track.contributors.length > 0 ? (
                    track.contributors.map((contributor, idx) => (
                      <span key={idx} className="px-2 py-1 bg-muted text-xs rounded">
                        {contributor.name} ({contributor.role})
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted">No contributors</span>
                  )}
                </div>
              )}
            </div>

            {/* Lyrics Files */}
            <div>
              <span className="text-sm font-medium text-foreground block mb-2">Lyrics Files</span>
              
              {isEditing ? (
                <div className="grid grid-cols-3 gap-2">
                  {(['txt', 'lrc', 'ttml'] as const).map((format) => {
                    const existingFile = track.lyricFiles?.find(lf => lf.format === format)
                    return (
                      <div key={format} className="border border-border rounded p-2 text-center">
                        <div className="text-xs font-medium mb-1">{format.toUpperCase()}</div>
                        {existingFile ? (
                          <div className="space-y-1">
                            <FileText className="w-4 h-4 text-success mx-auto" />
                            <button
                              onClick={() => removeLyricFile(format)}
                              className="text-xs text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <input
                              type="file"
                              accept={`.${format}`}
                              onChange={(e) => handleLyricUpload(format, e)}
                              className="hidden"
                              id={`lyrics-${format}-${file.id}`}
                            />
                            <label
                              htmlFor={`lyrics-${format}-${file.id}`}
                              className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Upload className="w-4 h-4 mx-auto mb-1" />
                              Upload
                            </label>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex gap-2">
                  {(['txt', 'lrc', 'ttml'] as const).map((format) => {
                    const hasFile = track.lyricFiles?.some(lf => lf.format === format)
                    return (
                      <span
                        key={format}
                        className={`px-2 py-1 text-xs rounded ${
                          hasFile
                            ? 'bg-success/10 text-success border border-success/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {format.toUpperCase()}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {audioFiles.length === 0 && (
        <div className="text-center py-12 text-muted">
          <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg">No audio tracks uploaded yet</p>
          <p className="text-sm">Upload audio files to see them here</p>
        </div>
      )}
    </div>
  )
} 