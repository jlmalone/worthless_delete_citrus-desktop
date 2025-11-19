export interface SyncItem {
  id: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

export class OfflineSync {
  private queue: SyncItem[] = [];

  /**
   * Adds an item to the sync queue
   */
  addToQueue(data: any): SyncItem {
    const item: SyncItem = {
      id: this.generateId(),
      data,
      timestamp: Date.now(),
      synced: false
    };
    this.queue.push(item);
    return item;
  }

  /**
   * Gets all pending items
   */
  getPendingItems(): SyncItem[] {
    return this.queue.filter(item => !item.synced);
  }

  /**
   * Marks an item as synced
   */
  markAsSynced(id: string): boolean {
    const item = this.queue.find(i => i.id === id);
    if (item) {
      item.synced = true;
      return true;
    }
    return false;
  }

  /**
   * Clears synced items from queue
   */
  clearSyncedItems(): number {
    const beforeLength = this.queue.length;
    this.queue = this.queue.filter(item => !item.synced);
    return beforeLength - this.queue.length;
  }

  /**
   * Gets queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
