import { useState } from 'react'
import './BulkOperations.css'

interface Receipt {
  id: string
  name: string
  data: string
  timestamp: number
  annotations?: string[]
  synced: boolean
}

interface BulkOperationsProps {
  receipts: Receipt[]
  onDelete: (ids: string[]) => void
  onUpdate: (id: string, updates: Partial<Receipt>) => void
}

function BulkOperations({ receipts, onDelete, onUpdate }: BulkOperationsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string>('none')

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const selectAll = () => {
    setSelectedIds(new Set(receipts.map(r => r.id)))
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  const executeBulkAction = () => {
    if (selectedIds.size === 0) {
      alert('No receipts selected')
      return
    }

    switch (bulkAction) {
      case 'delete':
        if (confirm(`Delete ${selectedIds.size} receipt(s)?`)) {
          onDelete(Array.from(selectedIds))
          clearSelection()
          alert('Receipts deleted successfully')
        }
        break
      case 'mark-synced':
        selectedIds.forEach(id => {
          onUpdate(id, { synced: true })
        })
        clearSelection()
        alert('Receipts marked as synced')
        break
      case 'mark-unsynced':
        selectedIds.forEach(id => {
          onUpdate(id, { synced: false })
        })
        clearSelection()
        alert('Receipts marked as unsynced')
        break
      default:
        alert('Please select an action')
    }
  }

  const exportSelected = () => {
    if (selectedIds.size === 0) {
      alert('No receipts selected')
      return
    }

    const selectedReceipts = receipts.filter(r => selectedIds.has(r.id))
    const dataStr = JSON.stringify(selectedReceipts, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `receipts-export-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="component-container bulk-operations">
      <h2>📋 Bulk Operations</h2>

      <div className="bulk-controls">
        <div className="selection-controls">
          <button className="btn btn-secondary" onClick={selectAll}>
            Select All ({receipts.length})
          </button>
          <button className="btn btn-secondary" onClick={clearSelection}>
            Clear Selection
          </button>
          <span className="selection-count">
            Selected: {selectedIds.size}
          </span>
        </div>

        <div className="action-controls">
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="none">Choose action...</option>
            <option value="delete">Delete</option>
            <option value="mark-synced">Mark as Synced</option>
            <option value="mark-unsynced">Mark as Unsynced</option>
          </select>
          <button className="btn btn-primary" onClick={executeBulkAction}>
            Execute Action
          </button>
          <button className="btn btn-success" onClick={exportSelected}>
            Export Selected
          </button>
        </div>
      </div>

      <div className="receipts-grid">
        {receipts.length === 0 ? (
          <div className="empty-state">
            <p>No receipts available. Upload or capture some receipts first!</p>
          </div>
        ) : (
          receipts.map(receipt => (
            <div
              key={receipt.id}
              className={`receipt-card ${selectedIds.has(receipt.id) ? 'selected' : ''}`}
              onClick={() => toggleSelection(receipt.id)}
            >
              <div className="receipt-image">
                <img src={receipt.data} alt={receipt.name} />
                {selectedIds.has(receipt.id) && (
                  <div className="selected-overlay">✓</div>
                )}
              </div>
              <div className="receipt-details">
                <h4>{receipt.name}</h4>
                <p className="receipt-date">
                  {new Date(receipt.timestamp).toLocaleDateString()}
                </p>
                <div className="receipt-status">
                  <span className={`status-badge ${receipt.synced ? 'synced' : 'unsynced'}`}>
                    {receipt.synced ? '✓ Synced' : '○ Pending'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BulkOperations
