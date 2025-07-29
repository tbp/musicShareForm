import { ReleaseFormScreen } from '@/components/screens/release-form-screen'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <ReleaseFormScreen />
        </div>
      </div>
    </main>
  )
}
