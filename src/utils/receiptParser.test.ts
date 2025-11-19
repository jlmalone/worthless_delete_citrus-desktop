import { ReceiptParser, Receipt } from './receiptParser';

describe('ReceiptParser', () => {
  describe('isValidAmount', () => {
    it('should return true for positive numbers', () => {
      expect(ReceiptParser.isValidAmount(10.50)).toBe(true);
      expect(ReceiptParser.isValidAmount(0.01)).toBe(true);
      expect(ReceiptParser.isValidAmount(1000)).toBe(true);
    });

    it('should return false for zero or negative numbers', () => {
      expect(ReceiptParser.isValidAmount(0)).toBe(false);
      expect(ReceiptParser.isValidAmount(-10)).toBe(false);
      expect(ReceiptParser.isValidAmount(-0.01)).toBe(false);
    });

    it('should return false for invalid numbers', () => {
      expect(ReceiptParser.isValidAmount(Infinity)).toBe(false);
      expect(ReceiptParser.isValidAmount(-Infinity)).toBe(false);
      expect(ReceiptParser.isValidAmount(NaN)).toBe(false);
    });
  });

  describe('formatAmount', () => {
    it('should format valid amounts correctly', () => {
      expect(ReceiptParser.formatAmount(10)).toBe('$10.00');
      expect(ReceiptParser.formatAmount(10.5)).toBe('$10.50');
      expect(ReceiptParser.formatAmount(10.99)).toBe('$10.99');
      expect(ReceiptParser.formatAmount(0.01)).toBe('$0.01');
    });

    it('should throw error for invalid amounts', () => {
      expect(() => ReceiptParser.formatAmount(0)).toThrow('Invalid amount');
      expect(() => ReceiptParser.formatAmount(-10)).toThrow('Invalid amount');
      expect(() => ReceiptParser.formatAmount(NaN)).toThrow('Invalid amount');
    });
  });

  describe('parseDate', () => {
    it('should parse valid date strings', () => {
      const date1 = ReceiptParser.parseDate('2024-01-15');
      expect(date1).toBeInstanceOf(Date);
      expect(date1.getFullYear()).toBe(2024);
      expect(date1.getMonth()).toBe(0); // January is 0

      const date2 = ReceiptParser.parseDate('2024-12-31T23:59:59Z');
      expect(date2).toBeInstanceOf(Date);
    });

    it('should throw error for invalid date strings', () => {
      expect(() => ReceiptParser.parseDate('invalid')).toThrow('Invalid date string');
      expect(() => ReceiptParser.parseDate('')).toThrow('Invalid date string');
      expect(() => ReceiptParser.parseDate('not-a-date')).toThrow('Invalid date string');
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total from multiple receipts', () => {
      const receipts: Receipt[] = [
        { id: '1', vendor: 'Store A', amount: 10.50, date: new Date(), items: [] },
        { id: '2', vendor: 'Store B', amount: 25.75, date: new Date(), items: [] },
        { id: '3', vendor: 'Store C', amount: 5.25, date: new Date(), items: [] }
      ];

      expect(ReceiptParser.calculateTotal(receipts)).toBe(41.50);
    });

    it('should return 0 for empty array', () => {
      expect(ReceiptParser.calculateTotal([])).toBe(0);
    });

    it('should handle single receipt', () => {
      const receipts: Receipt[] = [
        { id: '1', vendor: 'Store A', amount: 10.50, date: new Date(), items: [] }
      ];

      expect(ReceiptParser.calculateTotal(receipts)).toBe(10.50);
    });
  });
});
