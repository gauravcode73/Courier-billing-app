import { Request, Response } from 'express';
import { GoogleSheetsService, BillRecord } from '../services/google-sheets.service';
import { PdfService } from '../services/pdf.service';
import { billSchema } from '../utils/validation';
import { numberToWords } from '../utils/number-to-words';

const sheetsService = new GoogleSheetsService();
const pdfService = new PdfService();

// Helper to format Date and Time in Indian timezone
const getISTDateTime = () => {
  const dateObj = new Date();
  // Adjust for IST (+5:30)
  const offset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(dateObj.getTime() + offset);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(istDate.getUTCDate()).padStart(2, '0');
  
  const hours = String(istDate.getUTCHours()).padStart(2, '0');
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');

  return {
    date: `${day}-${month}-${year}`,
    time: `${hours}:${minutes}:${seconds}`,
  };
};

export const getLatestNumbers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const numbers = await sheetsService.getLatestNumbers();
    res.json(numbers);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve booking numbers', details: err.message });
  }
};

export const createBill = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = billSchema.parse(req.body);

    // Fetch next sequential numbers (reserve strictly upon successful save)
    const nextSeq = await sheetsService.getLatestNumbers();
    const bookNumber = nextSeq.bookNumber;
    const consignmentNumber = nextSeq.consignmentNumber;

    // Automatic calculations
    const volumetricWeight = Math.round(((validatedData.length * validatedData.width * validatedData.height) / 5000) * 100) / 100;
    const chargeableWeight = Math.max(validatedData.actualWeight, volumetricWeight);
    const grandTotal = Math.round((validatedData.freightCharges + validatedData.handlingCharges + validatedData.otherCharges + validatedData.insuranceAmount) * 100) / 100;
    const amountInWords = numberToWords(grandTotal);

    const { date: autoDate, time: autoTime } = getISTDateTime();

    const record: BillRecord = {
      bookNumber,
      consignmentNumber,
      date: validatedData.date || autoDate,
      time: validatedData.time || autoTime,
      bookingType: validatedData.bookingType,
      bookingMode: validatedData.bookingMode,
      productType: validatedData.productType,
      destination: validatedData.destination,
      senderName: validatedData.senderName,
      senderAddress: `${validatedData.senderAddress1}${validatedData.senderAddress2 ? ', ' + validatedData.senderAddress2 : ''}`,
      senderCity: validatedData.senderCity,
      senderState: validatedData.senderState,
      senderPincode: validatedData.senderPincode,
      senderMobile: validatedData.senderMobile,
      receiverName: validatedData.receiverName,
      receiverAddress: `${validatedData.receiverAddress1}${validatedData.receiverAddress2 ? ', ' + validatedData.receiverAddress2 : ''}`,
      receiverCity: validatedData.receiverCity,
      receiverState: validatedData.receiverState,
      receiverPincode: validatedData.receiverPincode,
      receiverMobile: validatedData.receiverMobile,
      articles: validatedData.articles,
      actualWeight: validatedData.actualWeight,
      length: validatedData.length,
      width: validatedData.width,
      height: validatedData.height,
      volumetricWeight,
      chargeableWeight,
      description: validatedData.description,
      freightCharges: validatedData.freightCharges,
      handlingCharges: validatedData.handlingCharges,
      otherCharges: validatedData.otherCharges,
      insuranceAmount: validatedData.insuranceAmount,
      grandTotal,
      amountInWords,
      paymentMode: validatedData.paymentMode,
      remarks: validatedData.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Google Sheets
    await sheetsService.appendBill(record);

    res.status(201).json({
      message: 'Bill created successfully',
      data: record,
    });
  } catch (err: any) {
    if (err.errors) {
      // Zod validation error
      res.status(400).json({ error: 'Validation failed', details: err.errors });
    } else {
      res.status(500).json({ error: 'Failed to create bill', details: err.message });
    }
  }
};

export const getBills = async (req: Request, res: Response): Promise<void> => {
  try {
    const bills = await sheetsService.getAllBills();
    const query = req.query.search ? String(req.query.search).toLowerCase() : '';

    if (!query) {
      res.json(bills);
      return;
    }

    // Filter bills on keyword
    const filtered = bills.filter((b) => {
      return (
        String(b.bookNumber).includes(query) ||
        String(b.consignmentNumber).includes(query) ||
        b.senderName.toLowerCase().includes(query) ||
        b.receiverName.toLowerCase().includes(query) ||
        b.senderMobile.includes(query) ||
        b.receiverMobile.includes(query) ||
        b.date.includes(query)
      );
    });

    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch bills', details: err.message });
  }
};

export const getBillByConsignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const consignmentNo = parseInt(req.params.consignmentNumber, 10);
    if (isNaN(consignmentNo)) {
      res.status(400).json({ error: 'Invalid Consignment Number' });
      return;
    }

    const bills = await sheetsService.getAllBills();
    const bill = bills.find(b => b.consignmentNumber === consignmentNo);

    if (!bill) {
      res.status(404).json({ error: `Consignment ${consignmentNo} not found` });
      return;
    }

    res.json(bill);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch bill details', details: err.message });
  }
};

export const updateBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const consignmentNo = parseInt(req.params.consignmentNumber, 10);
    if (isNaN(consignmentNo)) {
      res.status(400).json({ error: 'Invalid Consignment Number' });
      return;
    }

    // Validate body (partial allowed since it is update)
    const validatedData = billSchema.parse(req.body);

    const volumetricWeight = Math.round(((validatedData.length * validatedData.width * validatedData.height) / 5000) * 100) / 100;
    const chargeableWeight = Math.max(validatedData.actualWeight, volumetricWeight);
    const grandTotal = Math.round((validatedData.freightCharges + validatedData.handlingCharges + validatedData.otherCharges + validatedData.insuranceAmount) * 100) / 100;
    const amountInWords = numberToWords(grandTotal);

    const updateRecord: Partial<BillRecord> = {
      bookingType: validatedData.bookingType,
      bookingMode: validatedData.bookingMode,
      productType: validatedData.productType,
      destination: validatedData.destination,
      senderName: validatedData.senderName,
      senderAddress: `${validatedData.senderAddress1}${validatedData.senderAddress2 ? ', ' + validatedData.senderAddress2 : ''}`,
      senderCity: validatedData.senderCity,
      senderState: validatedData.senderState,
      senderPincode: validatedData.senderPincode,
      senderMobile: validatedData.senderMobile,
      receiverName: validatedData.receiverName,
      receiverAddress: `${validatedData.receiverAddress1}${validatedData.receiverAddress2 ? ', ' + validatedData.receiverAddress2 : ''}`,
      receiverCity: validatedData.receiverCity,
      receiverState: validatedData.receiverState,
      receiverPincode: validatedData.receiverPincode,
      receiverMobile: validatedData.receiverMobile,
      articles: validatedData.articles,
      actualWeight: validatedData.actualWeight,
      length: validatedData.length,
      width: validatedData.width,
      height: validatedData.height,
      volumetricWeight,
      chargeableWeight,
      description: validatedData.description,
      freightCharges: validatedData.freightCharges,
      handlingCharges: validatedData.handlingCharges,
      otherCharges: validatedData.otherCharges,
      insuranceAmount: validatedData.insuranceAmount,
      grandTotal,
      amountInWords,
      paymentMode: validatedData.paymentMode,
      remarks: validatedData.remarks || '',
    };

    if (validatedData.date) updateRecord.date = validatedData.date;
    if (validatedData.time) updateRecord.time = validatedData.time;

    await sheetsService.updateBill(consignmentNo, updateRecord);

    // Fetch the updated full record to send back
    const bills = await sheetsService.getAllBills();
    const updatedRecord = bills.find(b => b.consignmentNumber === consignmentNo);

    res.json({
      message: 'Bill updated successfully',
      data: updatedRecord,
    });
  } catch (err: any) {
    if (err.errors) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
    } else {
      res.status(500).json({ error: 'Failed to update bill', details: err.message });
    }
  }
};

export const deleteBill = async (req: Request, res: Response): Promise<void> => {
  try {
    const consignmentNo = parseInt(req.params.consignmentNumber, 10);
    if (isNaN(consignmentNo)) {
      res.status(400).json({ error: 'Invalid Consignment Number' });
      return;
    }

    await sheetsService.deleteBill(consignmentNo);
    res.json({ message: `Bill with consignment number ${consignmentNo} deleted successfully` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete bill', details: err.message });
  }
};

export const downloadPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const consignmentNo = parseInt(req.params.consignmentNumber, 10);
    if (isNaN(consignmentNo)) {
      res.status(400).json({ error: 'Invalid Consignment Number' });
      return;
    }

    const bills = await sheetsService.getAllBills();
    const record = bills.find((b) => b.consignmentNumber === consignmentNo);

    if (!record) {
      res.status(404).json({ error: `Consignment ${consignmentNo} not found` });
      return;
    }

    const pdfBuffer = await pdfService.fillTemplate(record);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=AmodXpress_Bill_${consignmentNo}.pdf`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('PDF Download Error:', err);
    res.status(500).json({ error: 'Failed to generate PDF', details: err.message });
  }
};
