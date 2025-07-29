'use client'

import { useState, useEffect } from 'react'
import { Music, Image as ImageIcon, FileText, Clock, HardDrive, Waves, Trash2, GripVertical, Settings } from 'lucide-react'
import { useFileUpload, type FileWithMetadata } from '@/hooks/use-file-upload'
import { TrackMetadataEditor } from './track-metadata-editor'
import { TrackFormData } from '@/types/ddex-release'

// Локальные утилиты
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes: number): string => {
  const sizes = ['B', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 B'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
}

interface FileManagerProps {
  onFilesChange?: (files: FileWithMetadata[]) => void
}

export function FileManager({ onFilesChange }: FileManagerProps) {
  const {
    files,
    isProcessing,
    addFiles,
    removeFile,
    updateTrackMetadata,
    getAudioFiles,
    getFilesWithErrors,
    reorderFiles
  } = useFileUpload()

  const [isDragOver, setIsDragOver] = useState(false)
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Уведомляем родительский компонент об изменениях
  useEffect(() => {
    onFilesChange?.(files)
  }, [files, onFilesChange])

  const handleFileUpload = (fileList: FileList | null) => {
    if (!fileList) return
    addFiles(Array.from(fileList))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const getFileIcon = (fileWithMetadata: FileWithMetadata) => {
    if (fileWithMetadata.type === 'audio') {
      return <Music className="w-5 h-5 text-green-500" />
    }
    if (fileWithMetadata.type === 'image') {
      return <ImageIcon className="w-5 h-5 text-blue-500" />
    }
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  const getQualityBadge = (quality: string) => {
    const colors = {
      'lossless': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'hi-res': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'lossy': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'unknown': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[quality as keyof typeof colors]}`}>
        {quality === 'lossless' && 'Lossless'}
        {quality === 'hi-res' && 'Hi-Res'}
        {quality === 'lossy' && 'Lossy'}
        {quality === 'unknown' && 'Unknown'}
      </span>
    )
  }

  // Drag & Drop функции для сортировки треков
  const handleTrackDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleTrackDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleTrackDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderFiles(draggedIndex, dropIndex)
    }
    
    setDraggedIndex(null)
  }

  const handleTrackDragEnd = () => {
    setDraggedIndex(null)
  }

  const audioFiles = getAudioFiles()
  const errorFiles = getFilesWithErrors()

  const editingTrack = editingTrackId ? files.find(f => f.id === editingTrackId) : null

  const handleTrackMetadataSave = (trackData: TrackFormData) => {
    if (editingTrackId) {
      updateTrackMetadata(editingTrackId, trackData)
    }
  }

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragOver
            ? 'border-foreground bg-accent'
            : 'border-border hover:border-foreground/50'
        }`}
      >
                    <div className="flex flex-col items-center">
              <Waves className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-heading mb-2">
                {isProcessing ? 'Processing Files...' : 'Add Music Files'}
              </h3>
              <p className="text-muted mb-4">
                Drag files here or click to select
              </p>
              <p className="text-sm text-muted mb-6">
                MP3, WAV, FLAC, M4A up to 500MB per track
              </p>
          
          <input
            type="file"
            multiple
                            accept="audio/*,.mp3,.wav,.flac,.m4a"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
                        <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-6 py-3 rounded-lg cursor-pointer transition-colors ${
                  isProcessing
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                <Music className="w-5 h-5 mr-2" />
                {isProcessing ? 'Processing...' : 'Select Files'}
              </label>
        </div>
      </div>

                {/* Error Files */}
          {errorFiles.length > 0 && (
            <div className="professional-card p-6 border-destructive/20 bg-destructive/5">
              <h3 className="text-lg font-medium text-destructive mb-4">
                Upload Errors ({errorFiles.length})
              </h3>
          <div className="space-y-3">
                            {errorFiles.map((fileWithMetadata) => (
                  <div key={fileWithMetadata.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-medium text-destructive">{fileWithMetadata.file.name}</p>
                        <p className="text-sm text-destructive/80">{fileWithMetadata.error}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(fileWithMetadata.id)}
                      className="px-3 py-1 text-destructive hover:bg-destructive/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
          </div>
        </div>
      )}

                {/* Audio Files */}
          {audioFiles.length > 0 && (
            <div className="professional-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Music className="w-6 h-6 text-foreground" />
                  <h3 className="text-xl font-semibold text-heading">
                    Audio Tracks ({audioFiles.length})
                  </h3>
                </div>
                {audioFiles.length > 1 && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <GripVertical className="w-4 h-4" />
                    <span>Drag to reorder</span>
                  </div>
                )}
              </div>
          
          <div className="space-y-4">
            {audioFiles.map((fileWithMetadata, index) => (
              <div 
                key={fileWithMetadata.id} 
                className={`border border-slate-200 dark:border-slate-600 rounded-lg p-4 transition-all ${
                  draggedIndex === index 
                    ? 'opacity-50 scale-95 shadow-lg' 
                    : 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-500'
                }`}
                draggable={true}
                onDragStart={(e) => handleTrackDragStart(e, index)}
                onDragOver={handleTrackDragOver}
                onDrop={(e) => handleTrackDrop(e, index)}
                onDragEnd={handleTrackDragEnd}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        {getFileIcon(fileWithMetadata)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-muted rounded text-sm font-medium">
                              #{fileWithMetadata.trackMetadata?.trackNumber || index + 1}
                            </span>
                            {fileWithMetadata.quality && getQualityBadge(fileWithMetadata.quality)}
                            {fileWithMetadata.isProcessing && (
                              <span className="status-badge status-warning">
                                Processing...
                              </span>
                            )}
                            {!fileWithMetadata.trackMetadata?.contributors?.length && (
                              <span className="status-badge status-warning">
                                Missing Contributors
                              </span>
                            )}
                            {fileWithMetadata.trackMetadata?.lyricFiles?.length ? (
                              <span className="status-badge status-success">
                                {fileWithMetadata.trackMetadata.lyricFiles.length} Lyrics
                              </span>
                            ) : (
                              <span className="status-badge status-warning">
                                No Lyrics
                              </span>
                            )}
                          </div>
                      
                                                <h4 className="font-semibold text-heading mb-1">
                            {fileWithMetadata.trackMetadata?.title || fileWithMetadata.file.name}
                          </h4>

                          {fileWithMetadata.trackMetadata?.language && (
                            <p className="text-muted mb-2">
                              Language: {fileWithMetadata.trackMetadata.language}
                            </p>
                          )}
                      
                                                <div className="flex items-center gap-4 text-sm text-muted">
                            {fileWithMetadata.metadata?.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDuration(fileWithMetadata.metadata.duration)}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <HardDrive className="w-4 h-4" />
                              {formatFileSize(fileWithMetadata.file.size)}
                            </div>
                            {fileWithMetadata.trackMetadata?.bpm && (
                              <span>{fileWithMetadata.trackMetadata.bpm} BPM</span>
                            )}
                          </div>
                    </div>
                  </div>
                  
                                        <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingTrackId(fileWithMetadata.id)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                          title="Edit Track Metadata"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                                            <button
                          onClick={() => removeFile(fileWithMetadata.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                          title="Remove File"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Files Summary */}
      {files.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                          <span>
                Audio Tracks: {audioFiles.length}
              </span>
            <span>
              Общий размер: {formatFileSize(files.reduce((sum, f) => sum + f.file.size, 0))}
            </span>
          </div>
        </div>
                )}

          {/* Track Metadata Editor Modal */}
          {editingTrack && editingTrack.type === 'audio' && editingTrack.trackMetadata && (
            <TrackMetadataEditor
              trackData={editingTrack.trackMetadata}
              trackNumber={editingTrack.trackMetadata.trackNumber}
              fileName={editingTrack.file.name}
              onSave={handleTrackMetadataSave}
              onClose={() => setEditingTrackId(null)}
            />
          )}
        </div>
      )
    } 