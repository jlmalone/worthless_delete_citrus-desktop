import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';
import { Receipt, ViewType, Annotation } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('upload');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedReceipts, setSelectedReceipts] = useState<Set<string>>(new Set());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<'text' | 'highlight' | 'arrow'>('text');
  const [isDrawing, setIsDrawing] = useState(false);

  // Load receipts from offline storage on mount
  useEffect(() => {
    loadReceipts();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for quick capture from tray
    if (window.electronAPI) {
      window.electronAPI.onQuickCapture(() => {
        setCurrentView('webcam');
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when online
  useEffect(() => {
    if (isOnline && receipts.length > 0) {
      syncReceipts();
    }
  }, [isOnline]);

  const loadReceipts = async () => {
    if (window.electronAPI) {
      const stored = await window.electronAPI.store.get('receipts');
      if (stored) {
        setReceipts(stored);
      }
    }
  };

  const saveReceipts = async (newReceipts: Receipt[]) => {
    setReceipts(newReceipts);
    if (window.electronAPI) {
      await window.electronAPI.store.set('receipts', newReceipts);
    }
  };

  const syncReceipts = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSyncing(false);
  };

  const addReceipt = async (imageData: string, name: string) => {
    const newReceipt: Receipt = {
      id: Date.now().toString(),
      name,
      date: new Date().toISOString(),
      imageData
    };
    await saveReceipts([...receipts, newReceipt]);
  };

  // Webcam capture
  const captureWebcam = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      addReceipt(imageSrc, `Receipt-${Date.now()}`);
      setCurrentView('receipts');
    }
  }, [webcamRef, receipts]);

  // Drag and drop upload
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string;
        addReceipt(imageData, file.name);
      };
      reader.readAsDataURL(file);
    });
    setCurrentView('receipts');
  }, [receipts]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] }
  });

  // Bulk operations
  const toggleSelectReceipt = (id: string) => {
    const newSelected = new Set(selectedReceipts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReceipts(newSelected);
  };

  const selectAll = () => {
    setSelectedReceipts(new Set(receipts.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedReceipts(new Set());
  };

  const deleteSelected = async () => {
    const remaining = receipts.filter(r => !selectedReceipts.has(r.id));
    await saveReceipts(remaining);
    setSelectedReceipts(new Set());
  };

  const exportSelected = () => {
    const selected = receipts.filter(r => selectedReceipts.has(r.id));
    const dataStr = JSON.stringify(selected, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipts-export-${Date.now()}.json`;
    link.click();
  };

  // Annotation functions
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedReceipt) return;
    setIsDrawing(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'text',
          x,
          y,
          text,
          color: '#FF0000'
        };
        setAnnotations([...annotations, newAnnotation]);
      }
      setIsDrawing(false);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const saveAnnotations = async () => {
    if (!selectedReceipt) return;

    const updatedReceipts = receipts.map(r =>
      r.id === selectedReceipt.id
        ? { ...r, annotations }
        : r
    );
    await saveReceipts(updatedReceipts);
    setCurrentView('receipts');
    setSelectedReceipt(null);
    setAnnotations([]);
  };

  // Render annotation canvas
  useEffect(() => {
    if (canvasRef.current && selectedReceipt) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvasRef.current!.width = img.width;
        canvasRef.current!.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Draw annotations
        annotations.forEach(ann => {
          ctx.fillStyle = ann.color;
          ctx.font = '16px Arial';
          if (ann.type === 'text' && ann.text) {
            ctx.fillText(ann.text, ann.x, ann.y);
          }
        });
      };
      img.src = selectedReceipt.imageData;
    }
  }, [selectedReceipt, annotations]);

  // Report builder
  const [reportFilters, setReportFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });

  const generateReport = () => {
    let filtered = [...receipts];

    if (reportFilters.startDate) {
      filtered = filtered.filter(r => r.date >= reportFilters.startDate);
    }
    if (reportFilters.endDate) {
      filtered = filtered.filter(r => r.date <= reportFilters.endDate);
    }
    if (reportFilters.category) {
      filtered = filtered.filter(r => r.category === reportFilters.category);
    }

    return filtered;
  };

  const exportReport = () => {
    const reportData = generateReport();
    const total = reportData.reduce((sum, r) => sum + (r.amount || 0), 0);

    const reportText = `
CITRUS RECEIPT REPORT
Generated: ${new Date().toLocaleString()}
Period: ${reportFilters.startDate || 'All'} to ${reportFilters.endDate || 'All'}
Category: ${reportFilters.category || 'All'}

Total Receipts: ${reportData.length}
Total Amount: $${total.toFixed(2)}

${reportData.map((r, i) => `
${i + 1}. ${r.name}
   Date: ${new Date(r.date).toLocaleDateString()}
   Amount: $${(r.amount || 0).toFixed(2)}
   Category: ${r.category || 'Uncategorized'}
`).join('\n')}
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citrus-report-${Date.now()}.txt`;
    link.click();
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h1>🍊 Citrus</h1>
        <button
          className={currentView === 'upload' ? 'active' : ''}
          onClick={() => setCurrentView('upload')}
        >
          📤 Upload
        </button>
        <button
          className={currentView === 'webcam' ? 'active' : ''}
          onClick={() => setCurrentView('webcam')}
        >
          📷 Webcam
        </button>
        <button
          className={currentView === 'receipts' ? 'active' : ''}
          onClick={() => setCurrentView('receipts')}
        >
          📄 Receipts ({receipts.length})
        </button>
        <button
          className={currentView === 'reports' ? 'active' : ''}
          onClick={() => setCurrentView('reports')}
        >
          📊 Reports
        </button>
      </div>

      <div className="main-content">
        {currentView === 'upload' && (
          <div className="content-card">
            <h2>Upload Receipts</h2>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <p>📁 Drag & drop receipt images here</p>
              <p style={{ fontSize: '14px', color: '#999' }}>or click to select files</p>
            </div>
          </div>
        )}

        {currentView === 'webcam' && (
          <div className="content-card">
            <h2>Capture Receipt</h2>
            <div className="webcam-container">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={640}
                height={480}
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: 'user'
                }}
              />
              <div className="webcam-controls">
                <button onClick={captureWebcam}>📸 Capture</button>
                <button onClick={() => setCurrentView('receipts')}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'receipts' && (
          <div className="content-card">
            <h2>My Receipts</h2>

            {selectedReceipts.size > 0 && (
              <div className="bulk-actions">
                <span>{selectedReceipts.size} selected</span>
                <button onClick={selectAll}>Select All</button>
                <button onClick={deselectAll}>Deselect All</button>
                <button onClick={deleteSelected} style={{ background: '#f44336' }}>
                  🗑️ Delete
                </button>
                <button onClick={exportSelected}>💾 Export</button>
              </div>
            )}

            <div className="receipts-grid">
              {receipts.map(receipt => (
                <div
                  key={receipt.id}
                  className="receipt-card"
                  onClick={() => {
                    setSelectedReceipt(receipt);
                    setAnnotations(receipt.annotations || []);
                    setCurrentView('annotate');
                  }}
                >
                  <input
                    type="checkbox"
                    className="select-checkbox"
                    checked={selectedReceipts.has(receipt.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelectReceipt(receipt.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <img src={receipt.imageData} alt={receipt.name} />
                  <h3>{receipt.name}</h3>
                  <p>{new Date(receipt.date).toLocaleDateString()}</p>
                  {receipt.amount && <p>${receipt.amount.toFixed(2)}</p>}
                </div>
              ))}
            </div>

            {receipts.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: '40px', color: '#999' }}>
                No receipts yet. Upload or capture your first receipt!
              </p>
            )}
          </div>
        )}

        {currentView === 'annotate' && selectedReceipt && (
          <div className="content-card">
            <h2>Annotate Receipt</h2>
            <div className="annotation-tools">
              <button
                className={currentTool === 'text' ? 'active' : ''}
                onClick={() => setCurrentTool('text')}
              >
                📝 Text
              </button>
              <button
                className={currentTool === 'highlight' ? 'active' : ''}
                onClick={() => setCurrentTool('highlight')}
              >
                🖍️ Highlight
              </button>
              <button
                className={currentTool === 'arrow' ? 'active' : ''}
                onClick={() => setCurrentTool('arrow')}
              >
                ➡️ Arrow
              </button>
              <button onClick={saveAnnotations} style={{ marginLeft: 'auto', background: '#4caf50' }}>
                💾 Save
              </button>
              <button onClick={() => {
                setCurrentView('receipts');
                setSelectedReceipt(null);
                setAnnotations([]);
              }}>
                Cancel
              </button>
            </div>
            <canvas
              ref={canvasRef}
              className="annotation-canvas"
              onMouseDown={handleCanvasMouseDown}
              onMouseUp={handleCanvasMouseUp}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        )}

        {currentView === 'reports' && (
          <div className="content-card">
            <h2>Report Builder</h2>
            <div className="report-builder">
              <div className="report-filters">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                />
                <select
                  value={reportFilters.category}
                  onChange={(e) => setReportFilters({ ...reportFilters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="office">Office</option>
                  <option value="other">Other</option>
                </select>
                <button onClick={exportReport} style={{ background: '#4caf50' }}>
                  📥 Export Report
                </button>
              </div>

              <div className="report-preview">
                <h3>Report Preview</h3>
                <p>Total Receipts: {generateReport().length}</p>
                <p>Total Amount: ${generateReport().reduce((sum, r) => sum + (r.amount || 0), 0).toFixed(2)}</p>
                <div style={{ marginTop: '20px' }}>
                  {generateReport().map((r, i) => (
                    <div key={r.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                      <strong>{i + 1}. {r.name}</strong><br />
                      Date: {new Date(r.date).toLocaleDateString()}<br />
                      Amount: ${(r.amount || 0).toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sync Status Indicator */}
      <div className={`sync-status ${isOnline ? 'online' : 'offline'}`}>
        {isSyncing && <div className="loading" />}
        {isOnline ? '🟢 Online' : '🔴 Offline Mode'}
      </div>
    </div>
  );
}

export default App;
