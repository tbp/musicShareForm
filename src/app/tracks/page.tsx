'use client'

import { useReleaseFormContext } from '@/contexts/release-form-context'
import { TrackCollectionManager } from '@/widgets/track-collection-manager'

export default function TracksPage() {
  const {
    audioFiles,
    setAudioFiles
  } = useReleaseFormContext()

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="professional-card p-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Аудио файлы
              </h2>
            </div>

            <TrackCollectionManager
              label="Треки релиза"
              accept="audio/*"
              multiple={true}
              maxFiles={50}
              maxSizeMB={100}
              value={audioFiles}
              onFilesChange={setAudioFiles}
              hint="Загрузите аудио файлы в форматах WAV, FLAC, MP3 (до 100МБ каждый)"
            />
          </div>
        </div>
      </div>
    </main>
  )
}