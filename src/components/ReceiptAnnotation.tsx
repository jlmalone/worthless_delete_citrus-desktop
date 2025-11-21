import { useState, useEffect } from 'react'
import './ReceiptAnnotation.css'

interface Receipt {
  id: string
  name: string
  data: string
  timestamp: number
  annotations?: string[]
  synced: boolean
}

interface ReceiptAnnotationProps {
  receipts: Receipt[]
  selectedReceipt: Receipt | null
  onSelect: (receipt: Receipt) => void
  onUpdate: (id: string, updates: Partial<Receipt>) => void
}

function ReceiptAnnotation({ receipts, selectedReceipt, onSelect, onUpdate }: ReceiptAnnotationProps) {
  const [newAnnotation, setNewAnnotation] = useState('')
  const [annotations, setAnnotations] = useState<string[]>([])

  useEffect(() => {
    if (selectedReceipt) {
      setAnnotations(selectedReceipt.annotations || [])
    }
  }, [selectedReceipt])

  const addAnnotation = () => {
    if (!selectedReceipt || !newAnnotation.trim()) {
      alert('Please enter an annotation')
      return
    }

    const updatedAnnotations = [...annotations, newAnnotation.trim()]
    setAnnotations(updatedAnnotations)
    onUpdate(selectedReceipt.id, { annotations: updatedAnnotations })
    setNewAnnotation('')
  }

  const removeAnnotation = (index: number) => {
    if (!selectedReceipt) return

    const updatedAnnotations = annotations.filter((_, i) => i !== index)
    setAnnotations(updatedAnnotations)
    onUpdate(selectedReceipt.id, { annotations: updatedAnnotations })
  }

  return (
    <div className="component-container receipt-annotation">
      <h2>✏️ Receipt Annotation</h2>

      <div className="annotation-layout">
        <div className="receipts-list">
          <h3>Select Receipt</h3>
          {receipts.length === 0 ? (
            <div className="empty-message">
              <p>No receipts available</p>
            </div>
          ) : (
            <div className="receipt-list-items">
              {receipts.map(receipt => (
                <div
                  key={receipt.id}
                  className={`receipt-list-item ${selectedReceipt?.id === receipt.id ? 'active' : ''}`}
                  onClick={() => onSelect(receipt)}
                >
                  <div className="receipt-thumbnail">
                    <img src={receipt.data} alt={receipt.name} />
                  </div>
                  <div className="receipt-info">
                    <p className="receipt-name">{receipt.name}</p>
                    <p className="receipt-meta">
                      {new Date(receipt.timestamp).toLocaleDateString()}
                    </p>
                    {receipt.annotations && receipt.annotations.length > 0 && (
                      <span className="annotation-count">
                        {receipt.annotations.length} note{receipt.annotations.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="annotation-panel">
          {selectedReceipt ? (
            <>
              <div className="receipt-preview">
                <img src={selectedReceipt.data} alt={selectedReceipt.name} />
              </div>

              <div className="annotation-controls">
                <h3>Add Notes & Annotations</h3>
                <div className="add-annotation">
                  <textarea
                    placeholder="Enter annotation or note..."
                    value={newAnnotation}
                    onChange={(e) => setNewAnnotation(e.target.value)}
                    rows={3}
                  />
                  <button className="btn btn-primary" onClick={addAnnotation}>
                    Add Note
                  </button>
                </div>

                <div className="annotations-list">
                  <h4>Notes ({annotations.length})</h4>
                  {annotations.length === 0 ? (
                    <p className="no-annotations">No annotations yet</p>
                  ) : (
                    annotations.map((annotation, index) => (
                      <div key={index} className="annotation-item">
                        <p>{annotation}</p>
                        <button
                          className="btn-remove-annotation"
                          onClick={() => removeAnnotation(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <p>Select a receipt to add annotations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReceiptAnnotation
