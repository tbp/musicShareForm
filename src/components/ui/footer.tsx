import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              © 2024 MusicShare. Создание музыкальных релизов.
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}