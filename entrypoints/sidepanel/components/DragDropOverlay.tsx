interface DragDropOverlayProps {
  visible: boolean
}

/**
 * DragDropOverlay - Blue see-through mask shown during file drag
 * 
 * Displays a full-screen overlay with blue tint and drop zone indicator
 * when files are being dragged over the extension.
 */
export function DragDropOverlay({ visible }: DragDropOverlayProps) {
  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-primary bg-background/80 px-12 py-8">
        <div className="text-4xl">📎</div>
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Drop files here</p>
          <p className="text-sm text-muted-foreground">
            Files will be added to your message
          </p>
        </div>
      </div>
    </div>
  )
}

