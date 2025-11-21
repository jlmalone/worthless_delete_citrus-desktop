import { useState, useRef } from 'react'
import './DragDropUpload.css'

interface DragDropUploadProps {
  onUpload: (name: string, data: string) => void
}

function DragDropUpload({ onUpload }: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [previewImages, setPreviewImages] = useState<Array<{name: string, data: string}>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      processFiles(files)
    }
  }

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageData = e.target.result as string
          setPreviewImages(prev => [...prev, { name: file.name, data: imageData }])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleUploadAll = () => {
    if (previewImages.length === 0) {
      alert('No images to upload')
      return
    }

    previewImages.forEach(img => {
      onUpload(img.name, img.data)
    })

    setPreviewImages([])
    alert(`${previewImages.length} receipt(s) uploaded successfully!`)
  }

  const removePreview = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => {
    setPreviewImages([])
  }

  return (
    <div className="component-container drag-drop-upload">
      <h2>📁 Drag & Drop Upload</h2>

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <div className="drop-icon">📎</div>
          <p className="drop-text">
            {isDragging ? 'Drop files here...' : 'Drag & drop receipt images here'}
          </p>
          <p className="drop-subtext">or click to browse</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {previewImages.length > 0 && (
        <div className="preview-section">
          <div className="preview-header">
            <h3>Preview ({previewImages.length} image{previewImages.length !== 1 ? 's' : ''})</h3>
            <div className="preview-actions">
              <button className="btn btn-success" onClick={handleUploadAll}>
                Upload All
              </button>
              <button className="btn btn-danger" onClick={clearAll}>
                Clear All
              </button>
            </div>
          </div>

          <div className="preview-grid">
            {previewImages.map((img, index) => (
              <div key={index} className="preview-item">
                <img src={img.data} alt={img.name} />
                <div className="preview-info">
                  <p className="preview-name">{img.name}</p>
                  <button
                    className="btn-remove"
                    onClick={() => removePreview(index)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DragDropUpload
