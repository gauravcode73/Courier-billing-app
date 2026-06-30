import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generateMockTemplate() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 dimensions: 595 x 842 points
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

  const drawRect = (x: number, y: number, width: number, height: number, color = rgb(0.95, 0.95, 0.95), border = true) => {
    page.drawRectangle({
      x,
      y,
      width,
      height,
      color,
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: border ? 1 : 0,
    });
  };

  // Header / Brand Area
  drawRect(20, 750, 555, 75, rgb(0.9, 0.93, 0.98));
  drawText('AMODXPRESS', 35, 795, 20, true);
  drawText('Fast & Reliable Courier Services', 35, 780, 10);
  drawText('Bada Bazar, Kashmiri Gate, Delhi - 110006 | Mob: +91 96545 27024 | Email: info@amodxpress.com', 35, 762, 8);

  // Booking Info Row
  drawRect(20, 700, 555, 40);
  drawText('Book No: [                     ]', 30, 715, 10, true);
  drawText('Consignment No: [                     ]', 200, 715, 10, true);
  drawText('Date: [                  ]  Time: [            ]', 380, 715, 9);

  // Booking Modes Row
  drawRect(20, 665, 555, 30);
  drawText('Booking Type: [             ]  Mode: [             ]  Product: [             ]  Dest: [             ]', 30, 675, 8.5);

  // Sender & Receiver Details Area
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

  // Shipment Details Section
  drawRect(20, 310, 555, 160);
  drawText('SHIPMENT DETAILS', 30, 450, 10, true);
  drawText('Articles: _______ Actual Wt: ________ kg  L: _____ cm  W: _____ cm  H: _____ cm', 30, 425);
  drawText('Volumetric Wt: ________ kg   Chargeable Wt: ________ kg', 30, 400);
  drawText('Description of Goods: __________________________________________________', 30, 375);
  drawText('Remarks: ______________________________________________________________', 30, 345);
  drawText('Payment Mode: [                 ]', 30, 322, 10, true);

  // Charges Section & GST section
  drawRect(20, 200, 320, 100);
  drawText('CHARGES & BILLING', 30, 280, 10, true);
  drawText('Freight Charges:  Rs. ___________', 30, 260);
  drawText('Handling Charges: Rs. ___________', 30, 240);
  drawText('Other Charges:    Rs. ___________', 30, 220);
  drawText('Insurance Amount: Rs. ___________', 30, 200); // Wait, make sure we fit it inside 200, 200 is bottom line. Let's adjust heights.

  // GST & Tax Box (To be removed by code)
  drawRect(350, 200, 225, 100, rgb(0.98, 0.9, 0.9));
  drawText('TAX DETAILS (GST AREA TO BE REMOVED)', 355, 280, 8, true);
  drawText('CGST Rate: 9%  - Amount: Rs. _____', 355, 260, 8);
  drawText('SGST Rate: 9%  - Amount: Rs. _____', 355, 240, 8);
  drawText('IGST Rate: 0%  - Amount: Rs. _____', 355, 220, 8);
  drawText('Total Tax:       Rs. _____', 355, 205, 8, true);

  // Grand Total & Amount In Words
  drawRect(20, 140, 555, 50);
  drawText('GRAND TOTAL: Rs. [                     ]', 30, 172, 11, true);
  drawText('Amount in Words: ________________________________________________________', 30, 150);

  // Terms and Conditions Section (Must remain)
  drawText('TERMS & CONDITIONS', 20, 115, 8, true);
  drawText('1. The company is not liable for any delay in transit due to force majeure.', 20, 102, 6.5);
  drawText('2. All disputes are subject to Delhi jurisdiction only. 3. Maximum liability is Rs. 100.', 20, 92, 6.5);

  // Signatures Section (To be removed/blocked by code)
  drawRect(20, 20, 555, 60, rgb(0.9, 0.98, 0.9));
  drawText('SIGNATURE AREA (TO BE REMOVED BY CODE)', 30, 68, 8, true);
  drawText('Sender Signature: _________________', 30, 40, 8);
  drawText('Company Signature: _________________', 210, 40, 8);
  drawText('Authorized Signatory: _________________', 390, 40, 8);

  const dir = path.dirname(path.join(__dirname, '../templates/courier_bill_template.pdf'));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(__dirname, '../templates/courier_bill_template.pdf'), pdfBytes);
  console.log('Mock PDF Template generated successfully at templates/courier_bill_template.pdf!');
}

generateMockTemplate().catch(err => {
  console.error('Error generating template:', err);
  process.exit(1);
});
