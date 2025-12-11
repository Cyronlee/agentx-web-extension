import { PromptInputButton } from '@/components/ai-elements/prompt-input'
import { WandSparklesIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { MagicTemplate } from '@/db'
import { getAllMagicTemplates } from '@/db'
import { MagicTemplateDialog } from './MagicTemplateDialog'

interface MagicTemplateButtonProps {
  onInsertTemplate: (content: string) => void
  onManageTemplates?: () => void
}

/**
 * MagicTemplateButton - Button to open magic template dialog
 */
export function MagicTemplateButton({
  onInsertTemplate,
  onManageTemplates,
}: MagicTemplateButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [templates, setTemplates] = useState<MagicTemplate[]>([])

  useEffect(() => {
    if (dialogOpen) {
      loadTemplates()
    }
  }, [dialogOpen])

  const loadTemplates = async () => {
    try {
      const allTemplates = await getAllMagicTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  return (
    <>
      <PromptInputButton
        className="!rounded-full border text-foreground cursor-pointer"
        variant="outline"
        onClick={() => setDialogOpen(true)}
      >
        <WandSparklesIcon size={16} />
        <span className="sr-only">Magic Template</span>
      </PromptInputButton>

      <MagicTemplateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        templates={templates}
        onInsertTemplate={onInsertTemplate}
        onManageTemplates={onManageTemplates}
      />
    </>
  )
}

