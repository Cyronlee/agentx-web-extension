import { useAppConfig } from '#imports'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useApiKey, type ProviderApiKeys } from '@/hooks/use-api-key'
import { useSettings } from '@/hooks/use-settings'
import { useTheme } from '@/hooks/use-theme'
import {
  Eye,
  EyeOff,
  Key,
  Monitor,
  Moon,
  Sun,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const PROVIDER_LABELS: Record<keyof ProviderApiKeys, string> = {
  aiGateway: 'Vercel AI Gateway',
  google: 'Google AI',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
}

export function SettingsView() {
  const config = useAppConfig()
  const { appearance, system, updateAppearance, updateSystem, resetSettings } =
    useSettings()
  const { apiKeys, setApiKey, loading: apiKeyLoading } = useApiKey()
  const { setTheme } = useTheme({
    theme: appearance.theme,
    onThemeChange: (theme) => updateAppearance({ theme }),
  })

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [apiKeyInputs, setApiKeyInputs] = useState<ProviderApiKeys>({
    aiGateway: '',
    google: '',
    openai: '',
    anthropic: '',
  })

  // Sync apiKeyInputs with loaded apiKeys
  useEffect(() => {
    if (!apiKeyLoading) {
      setApiKeyInputs(apiKeys)
    }
  }, [apiKeyLoading, apiKeys])

  const themeOptions = [
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ] as const

  const handleSyncIntervalChange = (value: string) => {
    const interval = parseInt(value)
    if (!isNaN(interval) && interval > 0) {
      updateSystem({ syncInterval: interval })
    }
  }

  const handleApiKeyChange = (provider: keyof ProviderApiKeys, value: string) => {
    setApiKeyInputs((prev) => ({ ...prev, [provider]: value }))
    setApiKey(provider, value)
  }

  const toggleShowApiKey = (provider: string) => {
    setShowApiKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {/* AI Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">AI Configuration</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Configure API keys for different AI providers
            </p>
          </div>

          <div className="space-y-4">
            {(Object.keys(PROVIDER_LABELS) as (keyof ProviderApiKeys)[]).map(
              (provider) => (
                <div key={provider} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    {PROVIDER_LABELS[provider]}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showApiKeys[provider] ? 'text' : 'password'}
                      value={apiKeyInputs[provider]}
                      onChange={(e) =>
                        handleApiKeyChange(provider, e.target.value)
                      }
                      placeholder={`Enter ${PROVIDER_LABELS[provider]} API key`}
                      className="pr-10"
                      disabled={apiKeyLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => toggleShowApiKey(provider)}
                    >
                      {showApiKeys[provider] ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              )
            )}
            <p className="text-xs text-muted-foreground">
              API keys are stored locally and never sent to third parties
            </p>
          </div>
        </div>

        <Separator />

        {/* Appearance Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Appearance</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Customize the look and feel
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isActive = appearance.theme === option.value
                return (
                  <Button
                    key={option.value}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTheme(option.value)}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs">{option.label}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        </div>

        <Separator />

        {/* System Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">System Settings</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Core extension functionality
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Enable push notifications
              </p>
            </div>
            <Switch
              checked={system.notifications}
              onCheckedChange={(checked) =>
                updateSystem({ notifications: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">
                Sync Interval (minutes)
              </Label>
              <p className="text-xs text-muted-foreground">
                Data synchronization frequency
              </p>
            </div>
            <Input
              type="number"
              value={system.syncInterval}
              onChange={(e) => handleSyncIntervalChange(e.target.value)}
              className="w-20 h-8 text-xs"
              min="1"
            />
          </div>
        </div>

        <Separator />

        {/* Runtime Configuration - Read Only */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Runtime Configuration</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Values from app.config.ts (read-only)
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Config Chat Status</Label>
              <p className="text-xs text-muted-foreground">
                Chat setting from runtime config
              </p>
            </div>
            <Badge
              variant={config.features?.enableChat ? 'default' : 'secondary'}
              className="text-xs"
            >
              {config.features?.enableChat ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Config Max Tokens</Label>
              <p className="text-xs text-muted-foreground">
                Token limit from runtime config
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              {config.features?.maxTokens}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={resetSettings}>
            Reset All
          </Button>
          <Button className="flex-1">Save Changes</Button>
        </div>
      </div>
    </ScrollArea>
  )
}
