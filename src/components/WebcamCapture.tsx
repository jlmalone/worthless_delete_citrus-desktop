import { useRef, useState, useEffect } from 'react'
import './WebcamCapture.css'

interface WebcamCaptureProps {
  onCapture: (name: string, data: string) => void
}

function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [receiptName, setReceiptName] = useState('')

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      console.error('Error accessing webcam:', err)
      alert('Could not access webcam. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        setCapturedImage(imageData)
      }
    }
  }

  const saveReceipt = () => {
    if (capturedImage && receiptName) {
      onCapture(receiptName, capturedImage)
      setCapturedImage(null)
      setReceiptName('')
      alert(`Receipt "${receiptName}" saved successfully!`)
    } else {
      alert('Please provide a name for the receipt.')
    }
  }

  const retake = () => {
    setCapturedImage(null)
    setReceiptName('')
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="component-container webcam-capture">
      <h2>📸 Webcam Receipt Capture</h2>

      <div className="webcam-controls">
        {!isStreaming ? (
          <button className="btn btn-primary" onClick={startCamera}>
            Start Camera
          </button>
        ) : (
          <>
            <button className="btn btn-danger" onClick={stopCamera}>
              Stop Camera
            </button>
            <button className="btn btn-success" onClick={capturePhoto}>
              Capture Photo
            </button>
          </>
        )}
      </div>

      <div className="webcam-display">
        {!capturedImage ? (
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={isStreaming ? 'active' : 'inactive'}
            />
            {!isStreaming && (
              <div className="placeholder">
                <p>Click "Start Camera" to begin</p>
              </div>
            )}
          </div>
        ) : (
          <div className="captured-image-container">
            <img src={capturedImage} alt="Captured receipt" />
            <div className="save-controls">
              <input
                type="text"
                placeholder="Enter receipt name..."
                value={receiptName}
                onChange={(e) => setReceiptName(e.target.value)}
              />
              <div className="button-group">
                <button className="btn btn-success" onClick={saveReceipt}>
                  Save Receipt
                </button>
                <button className="btn btn-secondary" onClick={retake}>
                  Retake
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default WebcamCapture
