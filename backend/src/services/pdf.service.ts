import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { BillRecord } from './google-sheets.service';

export class PdfService {
  private templatePath: string;

  constructor() {
    this.templatePath = path.join(__dirname, '../../templates/courier_bill_template.pdf');
  }

  // Helper to ensure the template exists. If not, generate a mock template.
  private async ensureTemplateExists() {
    if (!fs.existsSync(this.templatePath)) {
      console.log('⚠️ PDF template not found. Running mock template generator...');
      // Wait, let's write or import it. Since ts-node will compile it, we can just compile it or write a simple generator helper.
      // To be safe and decoupled from require, we can copy the template generator logic inline here as a fallback!
      await this.generateInlineMockTemplate();
    }
  }

  private async generateInlineMockTemplate() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (text: string, x: number, y: number, size = 10, useBold = false) => {
      page.drawText(text, {
        x,
        y,
        size,
        font: useBold ? boldFont : font,
        color: rgb(0.1, 0.1, 0.1),
      });
    };

    const drawRect = (x: number, y: number, width: number, height: number, color = rgb(0.95, 0.95, 0.95)) => {
      page.drawRectangle({
        x,
        y,
        width,
        height,
        color,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });
    };

    // Header
    drawRect(20, 750, 555, 75, rgb(0.9, 0.93, 0.98));
    drawText('AMODXPRESS', 35, 795, 20, true);
    drawText('Fast & Reliable Courier Services', 35, 780, 10);
    drawText('Bada Bazar, Kashmiri Gate, Delhi - 110006 | Mob: +91 96545 27024 | Email: info@amodxpress.com', 35, 762, 8);

    // Book & Consignment Info
    drawRect(20, 700, 555, 40);
    drawText('Book No: [                     ]', 30, 715, 10, true);
    drawText('Consignment No: [                     ]', 200, 715, 10, true);
    drawText('Date: [                  ]  Time: [            ]', 380, 715, 9);

    // Booking Modes
    drawRect(20, 665, 555, 30);
    drawText('Booking Type: [             ]  Mode: [             ]  Product: [             ]  Dest: [             ]', 30, 675, 8.5);

    // Sender & Receiver details
    drawRect(20, 480, 272, 175);
    drawRect(303, 480, 272, 175);
    drawText('SENDER DETAILS', 30, 640, 10, true);
    drawText('Name: _______________________________', 30, 615);
    drawText('Address 1: __________________________', 30, 590);
    drawText('Address 2: __________________________', 30, 565);
    drawText('City: _________________ State: ________', 30, 540);
    drawText('Pincode: ___________ Mobile: __________', 30, 515);

    drawText('RECEIVER DETAILS', 313, 640, 10, true);
    drawText('Name: _______________________________', 313, 615);
    drawText('Address 1: __________________________', 313, 590);
    drawText('Address 2: __________________________', 313, 565);
    drawText('City: _________________ State: ________', 313, 540);
    drawText('Pincode: ___________ Mobile: __________', 313, 515);

    // Shipment details
    drawRect(20, 310, 555, 160);
    drawText('SHIPMENT DETAILS', 30, 450, 10, true);
    drawText('Articles: _______ Actual Wt: ________ kg  L: _____ cm  W: _____ cm  H: _____ cm', 30, 425);
    drawText('Volumetric Wt: ________ kg   Chargeable Wt: ________ kg', 30, 400);
    drawText('Description of Goods: __________________________________________________', 30, 375);
    drawText('Remarks: ______________________________________________________________', 30, 345);
    drawText('Payment Mode: [                 ]', 30, 322, 10, true);

    // Charges Section
    drawRect(20, 200, 320, 100);
    drawText('CHARGES & BILLING', 30, 280, 10, true);
    drawText('Freight Charges:  Rs. ___________', 30, 260);
    drawText('Handling Charges: Rs. ___________', 30, 240);
    drawText('Other Charges:    Rs. ___________', 30, 220);
    drawText('Insurance Amount: Rs. ___________', 30, 200);

    // GST & Tax Box (to be removed)
    drawRect(350, 200, 225, 100, rgb(0.98, 0.9, 0.9));
    drawText('TAX DETAILS (GST AREA TO BE REMOVED)', 355, 280, 8, true);
    drawText('CGST Rate: 9%  - Amount: Rs. _____', 355, 260, 8);
    drawText('SGST Rate: 9%  - Amount: Rs. _____', 355, 240, 8);
    drawText('IGST Rate: 0%  - Amount: Rs. _____', 355, 220, 8);
    drawText('Total Tax:       Rs. _____', 355, 205, 8, true);

    // Grand Total & Words
    drawRect(20, 140, 555, 50);
    drawText('GRAND TOTAL: Rs. [                     ]', 30, 172, 11, true);
    drawText('Amount in Words: ________________________________________________________', 30, 150);

    // Terms
    drawText('TERMS & CONDITIONS', 20, 115, 8, true);
    drawText('1. The company is not liable for any delay in transit due to force majeure.', 20, 102, 6.5);
    drawText('2. All disputes are subject to Delhi jurisdiction only. 3. Maximum liability is Rs. 100.', 20, 92, 6.5);

    // Signatures (to be removed)
    drawRect(20, 20, 555, 60, rgb(0.9, 0.98, 0.9));
    drawText('SIGNATURE AREA (TO BE REMOVED BY CODE)', 30, 68, 8, true);
    drawText('Sender Signature: _________________', 30, 40, 8);
    drawText('Company Signature: _________________', 210, 40, 8);
    drawText('Authorized Signatory: _________________', 390, 40, 8);

    const dir = path.dirname(this.templatePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(this.templatePath, pdfBytes);
    console.log('✅ Generated fallback PDF template in templates directory.');
  }

  public async fillTemplate(record: BillRecord): Promise<Buffer> {
    await this.ensureTemplateExists();

    const existingPdfBytes = fs.readFileSync(this.templatePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Get the first page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (text: string, x: number, y: number, size = 10, useBold = false) => {
      firstPage.drawText(text, {
        x,
        y,
        size,
        font: useBold ? boldFont : font,
        color: rgb(0, 0, 0),
      });
    };

    // --- STEP 1: Apply White-Out blocks to remove GST and Signatures ---
    // GST area (from x=348 to x=577, y=198 to y=302)
    firstPage.drawRectangle({
      x: 348,
      y: 198,
      width: 228,
      height: 104,
      color: rgb(1, 1, 1), // White
      borderColor: rgb(1, 1, 1),
      borderWidth: 0,
    });

    // Signature Area at the bottom (from x=18 to x=577, y=18 to y=82)
    firstPage.drawRectangle({
      x: 18,
      y: 18,
      width: 559,
      height: 64,
      color: rgb(1, 1, 1), // White
      borderColor: rgb(1, 1, 1),
      borderWidth: 0,
    });

    // --- STEP 2: Fill text fields ---
    // Book No & Consignment No
    drawText(String(record.bookNumber), 85, 715, 10, true);
    drawText(String(record.consignmentNumber), 295, 715, 10, true);
    drawText(record.date, 418, 715, 9);
    drawText(record.time, 525, 715, 9);

    // Booking Modes & Destination
    drawText(record.bookingType, 100, 675, 8, true);
    drawText(record.bookingMode, 210, 675, 8, true);
    drawText(record.productType, 325, 675, 8, true);
    drawText(record.destination, 450, 675, 8, true);

    // Sender Details
    drawText(record.senderName, 65, 615, 9, true);
    // Split address if it is long, or write simple lines
    const senderAddrLines = this.splitAddress(record.senderAddress);
    drawText(senderAddrLines[0], 92, 590, 8.5);
    drawText(senderAddrLines[1], 92, 565, 8.5);
    drawText(record.senderCity, 65, 540, 9);
    drawText(record.senderState, 205, 540, 9);
    drawText(record.senderPincode, 80, 515, 9);
    drawText(record.senderMobile, 198, 515, 9, true);

    // Receiver Details
    drawText(record.receiverName, 350, 615, 9, true);
    const receiverAddrLines = this.splitAddress(record.receiverAddress);
    drawText(receiverAddrLines[0], 375, 590, 8.5);
    drawText(receiverAddrLines[1], 375, 565, 8.5);
    drawText(record.receiverCity, 348, 540, 9);
    drawText(record.receiverState, 485, 540, 9);
    drawText(record.receiverPincode, 363, 515, 9);
    drawText(record.receiverMobile, 482, 515, 9, true);

    // Shipment details
    drawText(String(record.articles), 80, 425, 10, true);
    drawText(String(record.actualWeight), 180, 425, 9);
    drawText(String(record.length), 252, 425, 9);
    drawText(String(record.width), 322, 425, 9);
    drawText(String(record.height), 392, 425, 9);

    drawText(String(record.volumetricWeight), 110, 400, 9);
    drawText(String(record.chargeableWeight), 260, 400, 10, true);
    drawText(record.description, 140, 375, 9);
    drawText(record.remarks || 'None', 80, 345, 9);
    drawText(record.paymentMode, 110, 322, 10, true);

    // Charges
    drawText(record.freightCharges.toFixed(2), 140, 260, 9.5);
    drawText(record.handlingCharges.toFixed(2), 140, 240, 9.5);
    drawText(record.otherCharges.toFixed(2), 140, 220, 9.5);
    drawText(record.insuranceAmount.toFixed(2), 140, 200, 9.5);

    // Grand Total & Words
    drawText(record.grandTotal.toFixed(2), 140, 172, 11, true);
    drawText(record.amountInWords, 120, 150, 8.5);

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  // Simple address splitter for visual formatting
  private splitAddress(address: string): [string, string] {
    if (address.length <= 35) {
      return [address, ''];
    }
    // Find a space or comma near middle
    let mid = Math.floor(address.length / 2);
    let splitIdx = address.lastIndexOf(' ', mid);
    if (splitIdx === -1) splitIdx = address.lastIndexOf(',', mid);
    if (splitIdx === -1) splitIdx = mid;

    const first = address.substring(0, splitIdx).trim();
    const second = address.substring(splitIdx).trim();
    return [first, second.substring(0, 35)]; // cap at 35 characters for second line
  }
}
