export interface BillRecord {
  bookNumber: number;
  consignmentNumber: number;
  date: string;
  time: string;
  bookingType: 'Domestic' | 'International';
  bookingMode: 'Air' | 'Surface';
  productType: 'Document' | 'Parcel' | 'Fragile' | 'Others';
  destination: string;
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderPincode: string;
  senderMobile: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  receiverState: string;
  receiverPincode: string;
  receiverMobile: string;
  articles: number;
  actualWeight: number;
  length: number;
  width: number;
  height: number;
  volumetricWeight: number;
  chargeableWeight: number;
  description: string;
  freightCharges: number;
  handlingCharges: number;
  otherCharges: number;
  insuranceAmount: number;
  grandTotal: number;
  amountInWords: string;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'To-Pay' | 'COD';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export class GoogleSheetsService {
  private scriptUrl: string = '';

  constructor() {
    this.scriptUrl = process.env.GOOGLE_SCRIPT_URL || '';
    if (!this.scriptUrl) {
      console.warn('⚠️ GOOGLE_SCRIPT_URL environment variable is missing.');
    }
  }

  public async getLatestNumbers(): Promise<{ bookNumber: number; consignmentNumber: number }> {
    try {
      if (!this.scriptUrl) return { bookNumber: 1101, consignmentNumber: 1101 };
      const response = await fetch(`${this.scriptUrl}?action=getLatestNumbers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json() as any;
    } catch (err: any) {
      console.error('❌ Error getting latest book numbers from Script:', err.message);
      return { bookNumber: 1101, consignmentNumber: 1101 };
    }
  }

  public async appendBill(record: BillRecord): Promise<void> {
    try {
      if (!this.scriptUrl) throw new Error('GOOGLE_SCRIPT_URL not configured');
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'append',
          record
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err: any) {
      console.error('❌ Error appending bill row to Google Sheet via Script:', err.message);
      throw new Error('Google Sheet insertion failed: ' + err.message);
    }
  }

  public async updateBill(consignmentNumber: number, record: Partial<BillRecord>): Promise<void> {
    try {
      if (!this.scriptUrl) throw new Error('GOOGLE_SCRIPT_URL not configured');
      const bills = await this.getAllBills();
      const existing = bills.find(b => b.consignmentNumber === consignmentNumber);
      if (!existing) {
        throw new Error(`Consignment ${consignmentNumber} not found`);
      }
      
      const updated = {
        ...existing,
        ...record,
        updatedAt: new Date().toISOString()
      };

      // To update in this AppScript flow, delete old and append new
      await this.deleteBill(consignmentNumber);
      await this.appendBill(updated as BillRecord);
    } catch (err: any) {
      console.error(`❌ Error updating consignment ${consignmentNumber} via Script:`, err.message);
      throw new Error('Google Sheet update failed: ' + err.message);
    }
  }

  public async deleteBill(consignmentNumber: number): Promise<void> {
    try {
      if (!this.scriptUrl) throw new Error('GOOGLE_SCRIPT_URL not configured');
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          consignmentNumber
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err: any) {
      console.error(`❌ Error deleting consignment ${consignmentNumber} via Script:`, err.message);
      throw new Error('Google Sheet deletion failed: ' + err.message);
    }
  }

  public async getAllBills(): Promise<BillRecord[]> {
    try {
      if (!this.scriptUrl) return [];
      const response = await fetch(`${this.scriptUrl}?action=getAll`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json() as BillRecord[];
    } catch (err: any) {
      console.error('❌ Error getting all bills from Google Sheet via Script:', err.message);
      return [];
    }
  }
}
