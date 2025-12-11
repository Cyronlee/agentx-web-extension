import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RefreshCwIcon, PlusIcon, InfoIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { MagicTemplate } from '@/db'
import { processTemplate } from './utils'

interface MagicTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: MagicTemplate[]
  onInsertTemplate: (content: string) => void
  onManageTemplates?: () => void
}

/**
 * MagicTemplateDialog - Dialog for selecting and previewing templates
 */
export function MagicTemplateDialog({
  open,
  onOpenChange,
  templates,
  onInsertTemplate,
  onManageTemplates,
}: MagicTemplateDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [originalContent, setOriginalContent] = useState('')
  const [processedContent, setProcessedContent] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Auto-select first template when dialog opens
  useEffect(() => {
    if (open && templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id)
    }
  }, [open, templates, selectedTemplateId])

  // Process template when selection changes
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find((t) => t.id === selectedTemplateId)
      if (template) {
        handleTemplateProcess(template)
      }
    }
  }, [selectedTemplateId])

  const handleTemplateProcess = async (template: MagicTemplate) => {
    setIsLoading(true)
    setOriginalContent(template.template)

    try {
      const processed = await processTemplate(template.template)
      setProcessedContent(processed)
      setEditedContent(processed)
    } catch (error) {
      console.error('Failed to process template:', error)
      setProcessedContent(template.template)
      setEditedContent(template.template)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReload = async () => {
    if (!selectedTemplateId) return

    const template = templates.find((t) => t.id === selectedTemplateId)
    if (template) {
      setIsLoading(true)
      try {
        const processed = await processTemplate(template.template)
        setProcessedContent(processed)
        setEditedContent(processed)
      } catch (error) {
        console.error('Failed to reload template:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleConfirm = () => {
    if (editedContent.trim()) {
      onInsertTemplate(editedContent)
      handleClose()
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after dialog closes
    setTimeout(() => {
      setSelectedTemplateId('')
      setOriginalContent('')
      setProcessedContent('')
      setEditedContent('')
    }, 200)
  }

  const handleManageTemplates = () => {
    handleClose()
    onManageTemplates?.()
  }

  if (templates.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>No Templates Found</DialogTitle>
            <DialogDescription>
              Create your first magic template to get started
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Button onClick={handleManageTemplates}>
              <PlusIcon size={16} className="mr-2" />
              Create Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Magic Template</DialogTitle>
          <DialogDescription>
            Generate dynamic content to the chat input.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Template Selector */}
          <div className="grid gap-2">
            <Label htmlFor="template-select">Select Template</Label>
            <Select
              value={selectedTemplateId}
              onValueChange={setSelectedTemplateId}
            >
              <SelectTrigger id="template-select" className="w-full">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Original Template */}
          <div className="grid gap-2">
            <Label>Original Template</Label>
            <ScrollArea className="h-[80px] rounded-md border">
              <Textarea
                value={originalContent}
                readOnly
                className="min-h-[100px] resize-none border-0 bg-muted font-mono text-sm focus-visible:ring-0"
                placeholder="Template content will appear here..."
              />
            </ScrollArea>
          </div>

          {/* Processed Content (Editable) */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Final Content</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReload}
                disabled={isLoading}
              >
                <RefreshCwIcon
                  size={14}
                  className={`mr-1 ${isLoading ? 'animate-spin' : ''}`}
                />
                Reload
              </Button>
            </div>
            <ScrollArea className="h-[160px] rounded-md border">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[150px] resize-none border-0 font-mono text-sm focus-visible:ring-0"
                placeholder="Processed content will appear here..."
                disabled={isLoading}
              />
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="flex-row justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!editedContent.trim() || isLoading}
          >
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
