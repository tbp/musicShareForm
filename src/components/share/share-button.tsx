'use client'

import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Share2, Lock, Globe, Link } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonProps {
  className?: string
}

export function ShareButton({ className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'share' | 'publish'>('share')
  const [copied, setCopied] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [access, setAccess] = useState<'view' | 'edit'>('view')
  const [privacy, setPrivacy] = useState<'private' | 'anyone'>('private')
  const [releaseUrl, setReleaseUrl] = useState('')

  // Генерируем URL релиза только на клиенте
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setReleaseUrl(`${window.location.origin}/release/demo-release-id`)
    }
  }, [])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(releaseUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleInviteUser = () => {
    // Здесь будет логика отправки приглашения
    console.log('Inviting user:', shareEmail, 'with access:', access)
    setShareEmail('')
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors",
            className
          )}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">Поделиться</span>
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="bg-background border border-border rounded-lg shadow-sm">
          {/* Simplified header */}
          <div className="p-4 border-b border-border">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('share')}
                className={cn(
                  "px-3 py-1 text-sm rounded transition-colors",
                  activeTab === 'share'
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Поделиться
              </button>
              <button
                onClick={() => setActiveTab('publish')}
                className={cn(
                  "px-3 py-1 text-sm rounded transition-colors",
                  activeTab === 'publish'
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Опубликовать
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {activeTab === 'share' ? (
              <div className="space-y-4">
                {/* Email input */}
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email или группа, через запятую"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                  />
                  <button 
                    onClick={handleInviteUser}
                    disabled={!shareEmail.trim()}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Пригласить
                  </button>
                </div>

                {/* Mock invited users section */}
                <div className="py-2">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                        Г
                      </div>
                      <div>
                        <div className="text-sm">Георгий Акопов <span className="text-muted-foreground">(Вы)</span></div>
                        <div className="text-xs text-muted-foreground">akopov@re.care</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Полный доступ</span>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <button className="text-sm text-muted-foreground hover:text-foreground">
                    Узнать о публикации
                  </button>
                  <button
                    onClick={handleCopyLink}
                    disabled={!releaseUrl}
                    className="px-3 py-1 text-sm border border-border rounded hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Link className="w-3 h-3" />
                    Копировать ссылку
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Веб-публикация</div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => setPrivacy('private')}
                    className={cn(
                      "w-full p-3 text-left border rounded transition-colors",
                      privacy === 'private'
                        ? "border-foreground/20 bg-muted/30"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Только приглашенные
                    </div>
                    <div className="text-xs text-muted-foreground">Только люди с доступом могут открывать по ссылке</div>
                  </button>

                  <button
                    onClick={() => setPrivacy('anyone')}
                    className={cn(
                      "w-full p-3 text-left border rounded transition-colors",
                      privacy === 'anyone'
                        ? "border-foreground/20 bg-muted/30"
                        : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Любой в интернете
                    </div>
                    <div className="text-xs text-muted-foreground">Любой может найти и открыть без входа в систему</div>
                  </button>
                </div>

                <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Опубликовать в веб
                </button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}