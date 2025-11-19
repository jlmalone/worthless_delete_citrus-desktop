import React, { useState } from 'react';

export interface AppProps {
  title?: string;
}

export const App: React.FC<AppProps> = ({ title = 'Citrus Desktop' }) => {
  const [receiptCount, setReceiptCount] = useState(0);

  const handleAddReceipt = () => {
    setReceiptCount(prev => prev + 1);
  };

  return (
    <div className="app">
      <h1>{title}</h1>
      <div className="receipt-counter">
        <p>Receipts: {receiptCount}</p>
        <button onClick={handleAddReceipt}>Add Receipt</button>
      </div>
    </div>
  );
};

export default App;
