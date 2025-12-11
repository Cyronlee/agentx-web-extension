import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  PlusIcon,
  Pencil,
  Trash2,
  WandSparklesIcon,
  ArrowLeft,
  Plus,
} from 'lucide-react'
import type { MagicTemplate } from '@/db'
import {
  getAllMagicTemplates,
  createMagicTemplate,
  updateMagicTemplate,
  deleteMagicTemplate,
} from '@/db'
import { TEMPLATE_VARIABLES } from '../components/magic-template'

/**
 * MagicTemplatesPage - Page for managing magic templates
 *
 * Single responsibility: CRUD operations for magic templates
 */
export function MagicTemplatesPage({ onBack }: { onBack: () => void }) {
  const [templates, setTemplates] = useState<MagicTemplate[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] =
    useState<MagicTemplate | null>(null)
  const [formData, setFormData] = useState({ name: '', template: '' })
  const createTextareaRef = useRef<HTMLTextAreaElement>(null)
  const editTextareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const allTemplates = await getAllMagicTemplates()
      setTemplates(allTemplates)
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.template.trim()) return

    try {
      await createMagicTemplate({
        name: formData.name,
        template: formData.template,
      })
      await loadTemplates()
      setIsCreateDialogOpen(false)
      setFormData({ name: '', template: '' })
    } catch (error) {
      console.error('Failed to create template:', error)
    }
  }

  const handleEdit = async () => {
    if (!selectedTemplate || !formData.name.trim() || !formData.template.trim())
      return

    try {
      await updateMagicTemplate(selectedTemplate.id, {
        name: formData.name,
        template: formData.template,
      })
      await loadTemplates()
      setIsEditDialogOpen(false)
      setSelectedTemplate(null)
      setFormData({ name: '', template: '' })
    } catch (error) {
      console.error('Failed to update template:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedTemplate) return

    try {
      await deleteMagicTemplate(selectedTemplate.id)
      await loadTemplates()
      setIsDeleteDialogOpen(false)
      setSelectedTemplate(null)
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const openCreateDialog = () => {
    setFormData({ name: '', template: '' })
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (template: MagicTemplate) => {
    setSelectedTemplate(template)
    setFormData({ name: template.name, template: template.template })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (template: MagicTemplate) => {
    setSelectedTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const insertVariable = (
    variable: string,
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.template
    const before = text.substring(0, start)
    const after = text.substring(end)
    const variableStr = `{{${variable}}}`

    const newText = before + variableStr + after
    setFormData({ ...formData, template: newText })

    // Set cursor position after the inserted variable
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + variableStr.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Chat
        </Button>
        <Button size="sm" onClick={() => openCreateDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          New Magic Template
        </Button>
      </div>

      {/* Template List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No templates found. Create your first template!
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-primary/10">
                  <WandSparklesIcon size={18} className="text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{template.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {template.template.slice(0, 60)}
                    {template.template.length > 60 ? '...' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(template)}
                    title="Edit template"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(template)}
                    title="Delete template"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Magic Template</DialogTitle>
            <DialogDescription>
              Create a new template with dynamic variables
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                placeholder="e.g., Code Review Request"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template">Template Content</Label>
              <div className="rounded-lg border bg-muted/50 p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    Dynamic variables:
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <Tooltip key={variable.key}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer text-xs hover:bg-secondary/80"
                          onClick={() =>
                            insertVariable(variable.key, createTextareaRef)
                          }
                        >
                          {`{{${variable.key}}}`}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="font-medium">{variable.label}</p>
                        <p className="text-xs opacity-80">
                          {variable.description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <ScrollArea className="h-[200px] rounded-md border">
                <Textarea
                  ref={createTextareaRef}
                  id="template"
                  placeholder="e.g., Please review this code:\n\n{{selected}}\n\nDate: {{date}}"
                  value={formData.template}
                  onChange={(e) =>
                    setFormData({ ...formData, template: e.target.value })
                  }
                  className="min-h-[200px] resize-none border-0 font-mono text-sm focus-visible:ring-0"
                />
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name.trim() || !formData.template.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Magic Template</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Template Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Code Review Request"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-template">Template Content</Label>
              <div className="rounded-lg border bg-muted/50 p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">
                    Quick insert variables:
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TEMPLATE_VARIABLES.map((variable) => (
                    <Tooltip key={variable.key}>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer text-xs hover:bg-secondary/80"
                          onClick={() =>
                            insertVariable(variable.key, editTextareaRef)
                          }
                        >
                          {`{{${variable.key}}}`}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {variable.description}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
              <ScrollArea className="h-[200px] rounded-md border">
                <Textarea
                  ref={editTextareaRef}
                  id="edit-template"
                  placeholder="e.g., Please review this code:\n\n{{selected}}\n\nDate: {{date}}"
                  value={formData.template}
                  onChange={(e) =>
                    setFormData({ ...formData, template: e.target.value })
                  }
                  className="min-h-[200px] resize-none border-0 font-mono text-sm focus-visible:ring-0"
                />
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!formData.name.trim() || !formData.template.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTemplate?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
