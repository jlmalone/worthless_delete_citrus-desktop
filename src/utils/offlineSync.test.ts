import { OfflineSync, SyncItem } from './offlineSync';

describe('OfflineSync', () => {
  let offlineSync: OfflineSync;

  beforeEach(() => {
    offlineSync = new OfflineSync();
  });

  describe('addToQueue', () => {
    it('should add item to queue', () => {
      const data = { test: 'data' };
      const item = offlineSync.addToQueue(data);

      expect(item).toBeDefined();
      expect(item.id).toBeTruthy();
      expect(item.data).toEqual(data);
      expect(item.synced).toBe(false);
      expect(item.timestamp).toBeGreaterThan(0);
    });

    it('should generate unique IDs', () => {
      const item1 = offlineSync.addToQueue({ data: 1 });
      const item2 = offlineSync.addToQueue({ data: 2 });

      expect(item1.id).not.toBe(item2.id);
    });

    it('should increase queue size', () => {
      expect(offlineSync.getQueueSize()).toBe(0);
      offlineSync.addToQueue({ test: 1 });
      expect(offlineSync.getQueueSize()).toBe(1);
      offlineSync.addToQueue({ test: 2 });
      expect(offlineSync.getQueueSize()).toBe(2);
    });
  });

  describe('getPendingItems', () => {
    it('should return all pending items', () => {
      offlineSync.addToQueue({ test: 1 });
      offlineSync.addToQueue({ test: 2 });

      const pending = offlineSync.getPendingItems();
      expect(pending).toHaveLength(2);
      expect(pending.every(item => !item.synced)).toBe(true);
    });

    it('should not return synced items', () => {
      const item1 = offlineSync.addToQueue({ test: 1 });
      offlineSync.addToQueue({ test: 2 });
      offlineSync.markAsSynced(item1.id);

      const pending = offlineSync.getPendingItems();
      expect(pending).toHaveLength(1);
      expect(pending[0].data.test).toBe(2);
    });

    it('should return empty array when all synced', () => {
      const item1 = offlineSync.addToQueue({ test: 1 });
      const item2 = offlineSync.addToQueue({ test: 2 });
      offlineSync.markAsSynced(item1.id);
      offlineSync.markAsSynced(item2.id);

      expect(offlineSync.getPendingItems()).toHaveLength(0);
    });
  });

  describe('markAsSynced', () => {
    it('should mark item as synced', () => {
      const item = offlineSync.addToQueue({ test: 'data' });
      const result = offlineSync.markAsSynced(item.id);

      expect(result).toBe(true);
      expect(offlineSync.getPendingItems()).toHaveLength(0);
    });

    it('should return false for non-existent ID', () => {
      const result = offlineSync.markAsSynced('non-existent-id');
      expect(result).toBe(false);
    });

    it('should handle multiple syncs', () => {
      const item1 = offlineSync.addToQueue({ test: 1 });
      const item2 = offlineSync.addToQueue({ test: 2 });
      const item3 = offlineSync.addToQueue({ test: 3 });

      offlineSync.markAsSynced(item1.id);
      offlineSync.markAsSynced(item3.id);

      const pending = offlineSync.getPendingItems();
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe(item2.id);
    });
  });

  describe('clearSyncedItems', () => {
    it('should remove all synced items', () => {
      const item1 = offlineSync.addToQueue({ test: 1 });
      const item2 = offlineSync.addToQueue({ test: 2 });
      offlineSync.addToQueue({ test: 3 });

      offlineSync.markAsSynced(item1.id);
      offlineSync.markAsSynced(item2.id);

      const cleared = offlineSync.clearSyncedItems();
      expect(cleared).toBe(2);
      expect(offlineSync.getQueueSize()).toBe(1);
    });

    it('should return 0 when no synced items', () => {
      offlineSync.addToQueue({ test: 1 });
      offlineSync.addToQueue({ test: 2 });

      const cleared = offlineSync.clearSyncedItems();
      expect(cleared).toBe(0);
      expect(offlineSync.getQueueSize()).toBe(2);
    });

    it('should keep pending items', () => {
      const item = offlineSync.addToQueue({ test: 'keep' });
      offlineSync.clearSyncedItems();

      const pending = offlineSync.getPendingItems();
      expect(pending).toHaveLength(1);
      expect(pending[0].id).toBe(item.id);
    });
  });

  describe('getQueueSize', () => {
    it('should return correct queue size', () => {
      expect(offlineSync.getQueueSize()).toBe(0);

      offlineSync.addToQueue({ test: 1 });
      expect(offlineSync.getQueueSize()).toBe(1);

      offlineSync.addToQueue({ test: 2 });
      offlineSync.addToQueue({ test: 3 });
      expect(offlineSync.getQueueSize()).toBe(3);
    });

    it('should reflect size after clearing', () => {
      const item1 = offlineSync.addToQueue({ test: 1 });
      offlineSync.addToQueue({ test: 2 });
      offlineSync.markAsSynced(item1.id);
      offlineSync.clearSyncedItems();

      expect(offlineSync.getQueueSize()).toBe(1);
    });
  });
});
