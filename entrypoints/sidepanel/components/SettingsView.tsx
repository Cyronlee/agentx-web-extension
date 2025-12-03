import { useAppConfig } from '#imports'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useApiKey, type ProviderApiKeys } from '@/hooks/use-api-key'
import { useMCPConfig } from '@/hooks/use-mcp-config'
import { useSettings } from '@/hooks/use-settings'
import { useTheme } from '@/hooks/use-theme'
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Key,
  Monitor,
  Moon,
  Server,
  Sun,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
  const {
    config: mcpConfig,
    getConfigAsJSON,
    setConfigFromJSON,
    hasServers,
    serverNames,
    error: mcpError,
    loading: mcpLoading,
  } = useMCPConfig()
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
  const [mcpJsonInput, setMcpJsonInput] = useState('')
  const [mcpJsonValid, setMcpJsonValid] = useState<boolean | null>(null)

  // Sync apiKeyInputs with loaded apiKeys
  useEffect(() => {
    if (!apiKeyLoading) {
      setApiKeyInputs(apiKeys)
    }
  }, [apiKeyLoading, apiKeys])

  // Sync MCP JSON input with loaded config (only on initial load)
  useEffect(() => {
    if (!mcpLoading) {
      setMcpJsonInput(getConfigAsJSON())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mcpLoading])

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

  const handleMcpJsonChange = (value: string) => {
    setMcpJsonInput(value)

    // Validate JSON as user types
    if (value.trim() === '') {
      setMcpJsonValid(null)
      return
    }

    try {
      const parsed = JSON.parse(value)
      // Valid if mcpServers exists and is an object (including empty object)
      if (typeof parsed.mcpServers === 'object' && parsed.mcpServers !== null) {
        setMcpJsonValid(true)
      } else {
        setMcpJsonValid(false)
      }
    } catch {
      // While typing, don't show error immediately for incomplete JSON
      setMcpJsonValid(null)
    }
  }

  const handleSaveMcpConfig = async () => {
    const success = await setConfigFromJSON(mcpJsonInput)
    if (success) {
      toast.success('MCP configuration saved')
    } else {
      toast.error('Invalid MCP configuration', {
        description: mcpError || 'Please check your JSON format',
      })
    }
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

        {/* MCP Configuration */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Server className="h-5 w-5" />
              MCP Servers
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Configure Model Context Protocol servers for tool access
            </p>
          </div>

          {/* Connected servers indicator */}
          {hasServers && (
            <div className="flex flex-wrap gap-2 mb-2">
              {serverNames.map((name) => (
                <Badge key={name} variant="secondary" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {name}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Configuration (JSON)</Label>
            <div className="relative">
              <Textarea
                value={mcpJsonInput}
                onChange={(e) => handleMcpJsonChange(e.target.value)}
                placeholder={`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}`}
                className="font-mono text-xs min-h-[200px] resize-y"
                disabled={mcpLoading}
              />
              {mcpJsonValid !== null && (
                <div className="absolute right-2 top-2">
                  {mcpJsonValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {mcpError && (
              <p className="text-xs text-destructive">{mcpError}</p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setMcpJsonInput(getConfigAsJSON())
                  setMcpJsonValid(null)
                }}
              >
                Reset
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleSaveMcpConfig}
                disabled={mcpJsonValid === false || mcpLoading}
              >
                Save MCP Config
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supports stdio, HTTP, and SSE transports. All tool calls require
              user confirmation.
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
