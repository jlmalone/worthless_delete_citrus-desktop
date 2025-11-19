export interface Receipt {
  id: string;
  vendor: string;
  amount: number;
  date: Date;
  items: string[];
}

export class ReceiptParser {
  /**
   * Validates if a receipt amount is valid
   */
  static isValidAmount(amount: number): boolean {
    return amount > 0 && Number.isFinite(amount);
  }

  /**
   * Formats a receipt amount to currency string
   */
  static formatAmount(amount: number): string {
    if (!this.isValidAmount(amount)) {
      throw new Error('Invalid amount');
    }
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Parses a date string to Date object
   */
  static parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }
    return date;
  }

  /**
   * Calculates total from multiple receipts
   */
  static calculateTotal(receipts: Receipt[]): number {
    return receipts.reduce((total, receipt) => total + receipt.amount, 0);
  }
}
