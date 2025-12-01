import { DebugView } from '../components/DebugView'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface DebugPageProps {
  onBack: () => void
}

export function DebugPage({ onBack }: DebugPageProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Back button header */}
      <div className="border-b px-4 py-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Button>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-hidden">
        <DebugView />
      </div>
    </div>
  )
}
