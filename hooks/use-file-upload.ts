import { useRef, useState, useCallback } from 'react'

export interface FilePart {
  type: 'file'
  filename: string
  mediaType: string
  url: string
}

async function fileToDataURL(file: File): Promise<FilePart> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve({
        type: 'file',
        filename: file.name,
        mediaType: file.type,
        url: reader.result as string,
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function convertFilesToDataURLs(files: FileList): Promise<FilePart[]> {
  return Promise.all(Array.from(files).map(fileToDataURL))
}

export function useFileUpload() {
  const [files, setFiles] = useState<FileList | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openFileDialog = useCallback((accept?: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept || '*/*'
      fileInputRef.current.click()
    }
  }, [])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(event.target.files)
    }
  }, [])

  const removeFile = useCallback((index: number) => {
    if (!files) return

    const dt = new DataTransfer()
    Array.from(files).forEach((f, i) => {
      if (i !== index) dt.items.add(f)
    })

    if (dt.files.length > 0) {
      setFiles(dt.files)
    } else {
      setFiles(undefined)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [files])

  const clearFiles = useCallback(() => {
    setFiles(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const getFileParts = useCallback(async (): Promise<FilePart[]> => {
    if (!files || files.length === 0) return []
    return convertFilesToDataURLs(files)
  }, [files])

  return {
    files,
    fileInputRef,
    openFileDialog,
    handleFileChange,
    removeFile,
    clearFiles,
    getFileParts,
    hasFiles: Boolean(files && files.length > 0),
    fileCount: files?.length ?? 0,
  }
}

