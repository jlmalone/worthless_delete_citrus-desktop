import { useState } from 'react'
import WebcamCapture from './components/WebcamCapture'
import DragDropUpload from './components/DragDropUpload'
import BulkOperations from './components/BulkOperations'
import ReceiptAnnotation from './components/ReceiptAnnotation'
import ReportBuilder from './components/ReportBuilder'
import OfflineSync from './components/OfflineSync'
import './App.css'

interface Receipt {
  id: string
  name: string
  data: string
  timestamp: number
  annotations?: string[]
  synced: boolean
}

function App() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [activeTab, setActiveTab] = useState<string>('capture')
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null)

  const addReceipt = (name: string, data: string) => {
    const newReceipt: Receipt = {
      id: Date.now().toString(),
      name,
      data,
      timestamp: Date.now(),
      synced: false,
    }
    setReceipts([...receipts, newReceipt])
  }

  const updateReceipt = (id: string, updates: Partial<Receipt>) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  const deleteReceipts = (ids: string[]) => {
    setReceipts(receipts.filter(r => !ids.includes(r.id)))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍊 Citrus Desktop</h1>
        <p>Receipt Management & Scanning Tool</p>
      </header>

      <nav className="app-nav">
        <button
          className={activeTab === 'capture' ? 'active' : ''}
          onClick={() => setActiveTab('capture')}
        >
          📸 Capture
        </button>
        <button
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          📁 Upload
        </button>
        <button
          className={activeTab === 'bulk' ? 'active' : ''}
          onClick={() => setActiveTab('bulk')}
        >
          📋 Bulk Ops
        </button>
        <button
          className={activeTab === 'annotate' ? 'active' : ''}
          onClick={() => setActiveTab('annotate')}
        >
          ✏️ Annotate
        </button>
        <button
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          📊 Reports
        </button>
        <button
          className={activeTab === 'sync' ? 'active' : ''}
          onClick={() => setActiveTab('sync')}
        >
          🔄 Sync
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'capture' && (
          <WebcamCapture onCapture={addReceipt} />
        )}
        {activeTab === 'upload' && (
          <DragDropUpload onUpload={addReceipt} />
        )}
        {activeTab === 'bulk' && (
          <BulkOperations
            receipts={receipts}
            onDelete={deleteReceipts}
            onUpdate={updateReceipt}
          />
        )}
        {activeTab === 'annotate' && (
          <ReceiptAnnotation
            receipts={receipts}
            selectedReceipt={selectedReceipt}
            onSelect={setSelectedReceipt}
            onUpdate={updateReceipt}
          />
        )}
        {activeTab === 'reports' && (
          <ReportBuilder receipts={receipts} />
        )}
        {activeTab === 'sync' && (
          <OfflineSync
            receipts={receipts}
            onUpdate={updateReceipt}
          />
        )}
      </main>

      <footer className="app-footer">
        <span>Total Receipts: {receipts.length}</span>
        <span>Synced: {receipts.filter(r => r.synced).length}</span>
        <span>Pending: {receipts.filter(r => !r.synced).length}</span>
      </footer>
    </div>
  )
}

export default App
