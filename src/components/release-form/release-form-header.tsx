import { ThemeToggle } from '@/components/ui/theme-toggle'

export function ReleaseFormHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Создание релиза
        </h1>
        <p className="text-muted-foreground">
          Заполните информацию о вашем музыкальном релизе
        </p>
      </div>
      <ThemeToggle />
    </div>
  )
} 