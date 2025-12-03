import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Wrench } from 'lucide-react'

// Human-in-the-loop approval states (must match backend)
export const APPROVAL = {
  YES: 'Yes, confirmed.',
  NO: 'No, denied.',
} as const

interface ToolConfirmationProps {
  toolCallId: string
  toolName: string
  input: unknown
  onConfirm: (approved: boolean) => void
}

export function ToolConfirmation({
  toolCallId,
  toolName,
  input,
  onConfirm,
}: ToolConfirmationProps) {
  return (
    <div className="my-2 rounded-lg border bg-background p-3">
      <div className="mb-2 flex items-center gap-2">
        <Wrench className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tool Request</span>
      </div>
      <div className="mb-2 text-sm">
        <span className="text-muted-foreground">Execute </span>
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          {toolName}
        </code>
      </div>
      <div className="mb-3 max-h-32 overflow-auto rounded bg-muted p-2 font-mono text-xs text-muted-foreground">
        {JSON.stringify(input, null, 2)}
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={() => onConfirm(true)}
          className="flex-1"
        >
          <CheckCircle className="mr-1 h-4 w-4" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onConfirm(false)}
          className="flex-1"
        >
          <XCircle className="mr-1 h-4 w-4" />
          Deny
        </Button>
      </div>
    </div>
  )
}

interface ToolResultProps {
  toolName: string
  output: unknown
  isError?: boolean
}

export function ToolResult({ toolName, output, isError }: ToolResultProps) {
  return (
    <div
      className={cn(
        'my-2 rounded-lg border p-3',
        isError
          ? 'border-destructive/50 bg-destructive/10'
          : 'border-green-500/50 bg-green-500/10'
      )}
    >
      <div className="mb-1 flex items-center gap-2">
        {isError ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
        <code className="font-mono text-xs">{toolName}</code>
      </div>
      <div className="max-h-24 overflow-auto font-mono text-xs text-muted-foreground">
        {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
      </div>
    </div>
  )
}

interface ToolRunningProps {
  toolName: string
}

export function ToolRunning({ toolName }: ToolRunningProps) {
  return (
    <div className="my-2 rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2">
        <Spinner className="h-4 w-4" />
        <code className="font-mono text-xs">{toolName}</code>
        <span className="text-xs text-muted-foreground">Running...</span>
      </div>
    </div>
  )
}

