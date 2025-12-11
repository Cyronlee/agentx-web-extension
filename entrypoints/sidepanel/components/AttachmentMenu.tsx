import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  PromptInputButton,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input'
import {
  CropIcon,
  FileIcon,
  ImageIcon,
  PaperclipIcon,
  XIcon,
} from 'lucide-react'

interface AttachmentMenuProps {
  onCaptureScreenshot: () => Promise<string | null>
  isCapturing: boolean
}

/**
 * AttachmentMenu - Dropdown menu for adding attachments
 *
 * Single responsibility: Provide UI for file upload and screenshot capture
 * State: Uses attachments context from PromptInput
 */
export function AttachmentMenu({
  onCaptureScreenshot,
  isCapturing,
}: AttachmentMenuProps) {
  const attachments = usePromptInputAttachments()

  const handleScreenshot = async () => {
    const dataUrl = await onCaptureScreenshot()
    if (dataUrl) {
      // Convert data URL to File and add to attachments
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], `screenshot-${Date.now()}.png`, {
        type: 'image/png',
      })
      attachments.add([file])
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PromptInputButton
          className="!rounded-full border text-foreground cursor-pointer"
          variant="outline"
        >
          <PaperclipIcon size={16} />
          {attachments.files.length > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {attachments.files.length}
            </span>
          )}
          <span className="sr-only">Attach</span>
        </PromptInputButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => attachments.openFileDialog()}>
          <FileIcon className="mr-2" size={16} />
          Upload file
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => attachments.openFileDialog()}>
          <ImageIcon className="mr-2" size={16} />
          Upload photo
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleScreenshot} disabled={isCapturing}>
          <CropIcon className="mr-2" size={16} />
          {isCapturing ? 'Capturing...' : 'Capture screenshot'}
        </DropdownMenuItem>
        {attachments.files.length > 0 && (
          <>
            <DropdownMenuItem disabled className="text-xs opacity-70">
              {attachments.files.map((f) => f.filename).join(', ')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => attachments.clear()}
              className="text-destructive"
            >
              <XIcon className="mr-2" size={16} />
              Clear attachments
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
