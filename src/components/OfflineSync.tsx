import { useState, useEffect } from 'react'
import localforage from 'localforage'
import './OfflineSync.css'

interface Receipt {
  id: string
  name: string
  data: string
  timestamp: number
  annotations?: string[]
  synced: boolean
}

interface OfflineSyncProps {
  receipts: Receipt[]
  onUpdate: (id: string, updates: Partial<Receipt>) => void
}

function OfflineSync({ receipts, onUpdate }: OfflineSyncProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete' | 'error'>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 })

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Load last sync time
    localforage.getItem<number>('lastSyncTime').then(time => {
      if (time) setLastSyncTime(time)
    })

    // Auto-save receipts to local storage
    saveToLocalStorage()

    // Update storage info
    updateStorageInfo()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [receipts])

  const saveToLocalStorage = async () => {
    try {
      await localforage.setItem('receipts', receipts)
      await updateStorageInfo()
    } catch (error) {
      console.error('Error saving to local storage:', error)
    }
  }

  const updateStorageInfo = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        setStorageInfo({
          used: estimate.usage || 0,
          total: estimate.quota || 0,
        })
      }
    } catch (error) {
      console.error('Error getting storage info:', error)
    }
  }

  const syncToCloud = async () => {
    if (!isOnline) {
      alert('Cannot sync while offline')
      return
    }

    setSyncStatus('syncing')

    // Simulate cloud sync (in real app, this would be an API call)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mark all as synced
      receipts.forEach(receipt => {
        if (!receipt.synced) {
          onUpdate(receipt.id, { synced: true })
        }
      })

      const now = Date.now()
      setLastSyncTime(now)
      await localforage.setItem('lastSyncTime', now)

      setSyncStatus('complete')
      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const loadFromLocalStorage = async () => {
    try {
      const stored = await localforage.getItem<Receipt[]>('receipts')
      if (stored && stored.length > 0) {
        alert(`Found ${stored.length} receipts in local storage`)
        // In a real app, merge with current receipts
      } else {
        alert('No receipts found in local storage')
      }
    } catch (error) {
      console.error('Error loading from local storage:', error)
      alert('Error loading from local storage')
    }
  }

  const clearLocalStorage = async () => {
    if (confirm('Clear all local storage data? This cannot be undone.')) {
      try {
        await localforage.clear()
        setLastSyncTime(null)
        await updateStorageInfo()
        alert('Local storage cleared')
      } catch (error) {
        console.error('Error clearing storage:', error)
        alert('Error clearing local storage')
      }
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const pendingCount = receipts.filter(r => !r.synced).length
  const syncedCount = receipts.filter(r => r.synced).length

  return (
    <div className="component-container offline-sync">
      <h2>🔄 Offline Mode & Sync</h2>

      <div className="sync-status-panel">
        <div className={`connection-status ${isOnline ? 'online' : 'offline'}`}>
          <span className="status-indicator"></span>
          <span className="status-text">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="sync-info">
          {lastSyncTime && (
            <p className="last-sync">
              Last sync: {formatDate(lastSyncTime)}
            </p>
          )}
        </div>
      </div>

      <div className="sync-stats">
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{syncedCount}</div>
            <div className="stat-label">Synced</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">○</div>
          <div className="stat-content">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <div className="stat-value">{receipts.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      <div className="storage-info-panel">
        <h3>Local Storage</h3>
        <div className="storage-bar">
          <div
            className="storage-used"
            style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
          ></div>
        </div>
        <p className="storage-text">
          {formatBytes(storageInfo.used)} of {formatBytes(storageInfo.total)} used
        </p>
      </div>

      <div className="sync-actions">
        <button
          className={`btn btn-primary ${syncStatus === 'syncing' ? 'syncing' : ''}`}
          onClick={syncToCloud}
          disabled={!isOnline || syncStatus === 'syncing' || pendingCount === 0}
        >
          {syncStatus === 'syncing' && '⟳ Syncing...'}
          {syncStatus === 'complete' && '✓ Sync Complete'}
          {syncStatus === 'error' && '✗ Sync Failed'}
          {syncStatus === 'idle' && `🔄 Sync to Cloud (${pendingCount})`}
        </button>

        <button
          className="btn btn-secondary"
          onClick={loadFromLocalStorage}
        >
          Load from Local Storage
        </button>

        <button
          className="btn btn-danger"
          onClick={clearLocalStorage}
        >
          Clear Local Storage
        </button>
      </div>

      <div className="offline-info">
        <h3>Offline Mode</h3>
        <p>
          All receipts are automatically saved to your browser's local storage.
          You can continue using the app offline, and sync when you're back online.
        </p>
        <ul>
          <li>Receipts are saved locally in real-time</li>
          <li>Works completely offline</li>
          <li>Sync with cloud when connection is restored</li>
          <li>Data persists between sessions</li>
        </ul>
      </div>
    </div>
  )
}

export default OfflineSync
