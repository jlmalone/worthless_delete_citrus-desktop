export interface Receipt {
  id: string;
  name: string;
  date: string;
  amount?: number;
  category?: string;
  imageData: string;
  annotations?: Annotation[];
  metadata?: {
    merchant?: string;
    notes?: string;
    tags?: string[];
  };
}

export interface Annotation {
  id: string;
  type: 'text' | 'highlight' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

export interface ElectronAPI {
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
    clear: () => Promise<boolean>;
    getAll: () => Promise<any>;
  };
  onQuickCapture: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export type ViewType = 'upload' | 'webcam' | 'receipts' | 'annotate' | 'reports';
