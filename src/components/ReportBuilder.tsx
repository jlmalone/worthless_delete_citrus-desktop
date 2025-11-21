import { useState } from 'react'
import './ReportBuilder.css'

interface Receipt {
  id: string
  name: string
  data: string
  timestamp: number
  annotations?: string[]
  synced: boolean
}

interface ReportBuilderProps {
  receipts: Receipt[]
}

function ReportBuilder({ receipts }: ReportBuilderProps) {
  const [reportTitle, setReportTitle] = useState('Receipt Report')
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'custom'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [includeImages, setIncludeImages] = useState(true)
  const [includeAnnotations, setIncludeAnnotations] = useState(true)
  const [format, setFormat] = useState<'pdf' | 'html' | 'json'>('html')

  const getFilteredReceipts = () => {
    let filtered = [...receipts]

    if (dateRange === 'week') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      filtered = filtered.filter(r => r.timestamp >= weekAgo)
    } else if (dateRange === 'month') {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      filtered = filtered.filter(r => r.timestamp >= monthAgo)
    } else if (dateRange === 'custom' && startDate && endDate) {
      const start = new Date(startDate).getTime()
      const end = new Date(endDate).getTime()
      filtered = filtered.filter(r => r.timestamp >= start && r.timestamp <= end)
    }

    return filtered
  }

  const generateReport = () => {
    const filteredReceipts = getFilteredReceipts()

    if (filteredReceipts.length === 0) {
      alert('No receipts match the selected criteria')
      return
    }

    if (format === 'json') {
      exportJSON(filteredReceipts)
    } else if (format === 'html') {
      exportHTML(filteredReceipts)
    } else {
      alert('PDF export requires additional library (jsPDF). HTML export available.')
      exportHTML(filteredReceipts)
    }
  }

  const exportJSON = (data: Receipt[]) => {
    const reportData = {
      title: reportTitle,
      generatedAt: new Date().toISOString(),
      totalReceipts: data.length,
      receipts: data.map(r => ({
        id: r.id,
        name: r.name,
        timestamp: r.timestamp,
        date: new Date(r.timestamp).toISOString(),
        annotations: includeAnnotations ? r.annotations : undefined,
        imageData: includeImages ? r.data : undefined,
        synced: r.synced,
      })),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportTitle.replace(/\s+/g, '-')}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportHTML = (data: Receipt[]) => {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportTitle}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #ff9a44 0%, #fc6076 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    h1 { margin: 0 0 10px; }
    .meta { opacity: 0.9; }
    .receipt {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .receipt h2 { color: #2c3e50; margin-top: 0; }
    .receipt-image {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 15px 0;
    }
    .annotations {
      background: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #ff9a44;
      margin-top: 15px;
      border-radius: 4px;
    }
    .annotations h3 {
      margin-top: 0;
      color: #2c3e50;
    }
    .annotation {
      padding: 8px 0;
      border-bottom: 1px solid #e1e8ed;
    }
    .annotation:last-child {
      border-bottom: none;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍊 ${reportTitle}</h1>
    <div class="meta">
      <p>Generated: ${new Date().toLocaleString()}</p>
      <p>Total Receipts: ${data.length}</p>
    </div>
  </div>

  ${data.map(receipt => `
    <div class="receipt">
      <h2>${receipt.name}</h2>
      <p><strong>Date:</strong> ${new Date(receipt.timestamp).toLocaleString()}</p>
      <p><strong>Status:</strong> ${receipt.synced ? '✓ Synced' : '○ Pending'}</p>
      ${includeImages ? `<img class="receipt-image" src="${receipt.data}" alt="${receipt.name}">` : ''}
      ${includeAnnotations && receipt.annotations && receipt.annotations.length > 0 ? `
        <div class="annotations">
          <h3>Notes & Annotations</h3>
          ${receipt.annotations.map(ann => `<div class="annotation">${ann}</div>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportTitle.replace(/\s+/g, '-')}-${Date.now()}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  const filteredCount = getFilteredReceipts().length

  return (
    <div className="component-container report-builder">
      <h2>📊 Report Builder</h2>

      <div className="report-config">
        <div className="config-section">
          <label>Report Title</label>
          <input
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="Enter report title..."
          />
        </div>

        <div className="config-section">
          <label>Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)}>
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {dateRange === 'custom' && (
          <div className="config-section date-range">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="config-section">
          <label>Export Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="pdf">PDF (uses HTML)</option>
          </select>
        </div>

        <div className="config-section checkboxes">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
            />
            Include Images
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeAnnotations}
              onChange={(e) => setIncludeAnnotations(e.target.checked)}
            />
            Include Annotations
          </label>
        </div>

        <div className="report-summary">
          <h3>Report Preview</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Receipts in Report:</span>
              <span className="stat-value">{filteredCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Total Available:</span>
              <span className="stat-value">{receipts.length}</span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary generate-btn"
          onClick={generateReport}
          disabled={filteredCount === 0}
        >
          Generate & Download Report
        </button>
      </div>
    </div>
  )
}

export default ReportBuilder
