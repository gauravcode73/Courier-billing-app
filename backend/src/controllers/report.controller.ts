import { Request, Response } from 'express';
import { GoogleSheetsService } from '../services/google-sheets.service';
import ExcelJS from 'exceljs';

const sheetsService = new GoogleSheetsService();

// Helper to check if a date is today (format DD-MM-YYYY)
const isToday = (dateStr: string): boolean => {
  const dateObj = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(dateObj.getTime() + offset);

  const day = String(istDate.getUTCDate()).padStart(2, '0');
  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const year = istDate.getUTCFullYear();
  const todayStr = `${day}-${month}-${year}`;

  return dateStr === todayStr;
};

// Helper to check if a date is in the current month (format DD-MM-YYYY)
const isCurrentMonth = (dateStr: string): boolean => {
  const dateObj = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(dateObj.getTime() + offset);

  const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const year = String(istDate.getUTCFullYear());
  
  // Format matches DD-MM-YYYY, so split by dash
  const parts = dateStr.split('-');
  return parts.length === 3 && parts[1] === month && parts[2] === year;
};

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bills = await sheetsService.getAllBills();

    // Calculations
    const todayBills = bills.filter(b => isToday(b.date));
    const todayBookingsCount = todayBills.length;
    const todayRevenue = todayBills.reduce((acc, curr) => acc + curr.grandTotal, 0);

    const totalShipments = bills.length;
    const totalWeight = bills.reduce((acc, curr) => acc + curr.chargeableWeight, 0);

    const monthlyRevenue = bills
      .filter(b => isCurrentMonth(b.date))
      .reduce((acc, curr) => acc + curr.grandTotal, 0);

    // Recent Bookings (limit to 10, newest first)
    const sortedBills = [...bills].sort((a, b) => {
      // Sort by createdAt descending
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const recentBookings = sortedBills.slice(0, 10);

    // Create a mock recent activity feed
    const recentActivity = sortedBills.slice(0, 5).map(b => ({
      id: String(b.consignmentNumber),
      type: 'booking',
      message: `Consignment No. ${b.consignmentNumber} booked for ${b.receiverName}`,
      time: b.time,
      date: b.date,
    }));

    res.json({
      todayBookingsCount,
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      totalShipments,
      totalWeight: Math.round(totalWeight * 100) / 100,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      recentBookings,
      recentActivity,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve stats', details: err.message });
  }
};

export const exportExcel = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bills = await sheetsService.getAllBills();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Consignments');

    // Define columns
    worksheet.columns = [
      { header: 'Book Number', key: 'bookNumber', width: 15 },
      { header: 'Consignment Number', key: 'consignmentNumber', width: 20 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Time', key: 'time', width: 12 },
      { header: 'Booking Type', key: 'bookingType', width: 15 },
      { header: 'Booking Mode', key: 'bookingMode', width: 15 },
      { header: 'Product Type', key: 'productType', width: 15 },
      { header: 'Sender Name', key: 'senderName', width: 25 },
      { header: 'Sender Address', key: 'senderAddress', width: 35 },
      { header: 'Sender City', key: 'senderCity', width: 15 },
      { header: 'Sender State', key: 'senderState', width: 15 },
      { header: 'Sender Pincode', key: 'senderPincode', width: 12 },
      { header: 'Sender Mobile', key: 'senderMobile', width: 15 },
      { header: 'Receiver Name', key: 'receiverName', width: 25 },
      { header: 'Receiver Address', key: 'receiverAddress', width: 35 },
      { header: 'Receiver City', key: 'receiverCity', width: 15 },
      { header: 'Receiver State', key: 'receiverState', width: 15 },
      { header: 'Receiver Pincode', key: 'receiverPincode', width: 12 },
      { header: 'Receiver Mobile', key: 'receiverMobile', width: 15 },
      { header: 'Articles', key: 'articles', width: 10 },
      { header: 'Actual Weight (kg)', key: 'actualWeight', width: 18 },
      { header: 'Length (cm)', key: 'length', width: 12 },
      { header: 'Width (cm)', key: 'width', width: 12 },
      { header: 'Height (cm)', key: 'height', width: 12 },
      { header: 'Volumetric Weight (kg)', key: 'volumetricWeight', width: 22 },
      { header: 'Chargeable Weight (kg)', key: 'chargeableWeight', width: 22 },
      { header: 'Description', key: 'description', width: 25 },
      { header: 'Freight Charges (Rs.)', key: 'freightCharges', width: 18 },
      { header: 'Handling Charges (Rs.)', key: 'handlingCharges', width: 18 },
      { header: 'Other Charges (Rs.)', key: 'otherCharges', width: 18 },
      { header: 'Insurance Amount (Rs.)', key: 'insuranceAmount', width: 18 },
      { header: 'Grand Total (Rs.)', key: 'grandTotal', width: 18 },
      { header: 'Amount in Words', key: 'amountInWords', width: 35 },
      { header: 'Payment Mode', key: 'paymentMode', width: 15 },
      { header: 'Remarks', key: 'remarks', width: 25 },
    ];

    // Formatting headers
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }, // Primary blue color
    };

    // Add rows
    bills.forEach((bill) => {
      worksheet.addRow(bill);
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=AmodXpress_Consignments.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    res.status(500).json({ error: 'Excel export failed', details: err.message });
  }
};

export const exportCsv = async (_req: Request, res: Response): Promise<void> => {
  try {
    const bills = await sheetsService.getAllBills();
    
    // Headers
    const headers = [
      'Book Number', 'Consignment Number', 'Date', 'Time', 'Booking Type', 'Booking Mode', 'Product Type',
      'Sender Name', 'Sender Address', 'Sender City', 'Sender State', 'Sender Pincode', 'Sender Mobile',
      'Receiver Name', 'Receiver Address', 'Receiver City', 'Receiver State', 'Receiver Pincode', 'Receiver Mobile',
      'Articles', 'Actual Weight', 'Length', 'Width', 'Height', 'Volumetric Weight', 'Chargeable Weight',
      'Description', 'Freight Charges', 'Handling Charges', 'Other Charges', 'Insurance Amount', 'Grand Total',
      'Amount in Words', 'Payment Mode', 'Remarks'
    ];

    let csvContent = headers.join(',') + '\n';

    bills.forEach((bill) => {
      const row = [
        bill.bookNumber,
        bill.consignmentNumber,
        `"${bill.date}"`,
        `"${bill.time}"`,
        `"${bill.bookingType}"`,
        `"${bill.bookingMode}"`,
        `"${bill.productType}"`,
        `"${bill.senderName.replace(/"/g, '""')}"`,
        `"${bill.senderAddress.replace(/"/g, '""')}"`,
        `"${bill.senderCity.replace(/"/g, '""')}"`,
        `"${bill.senderState.replace(/"/g, '""')}"`,
        `"${bill.senderPincode}"`,
        `"${bill.senderMobile}"`,
        `"${bill.receiverName.replace(/"/g, '""')}"`,
        `"${bill.receiverAddress.replace(/"/g, '""')}"`,
        `"${bill.receiverCity.replace(/"/g, '""')}"`,
        `"${bill.receiverState.replace(/"/g, '""')}"`,
        `"${bill.receiverPincode}"`,
        `"${bill.receiverMobile}"`,
        bill.articles,
        bill.actualWeight,
        bill.length,
        bill.width,
        bill.height,
        bill.volumetricWeight,
        bill.chargeableWeight,
        `"${bill.description.replace(/"/g, '""')}"`,
        bill.freightCharges,
        bill.handlingCharges,
        bill.otherCharges,
        bill.insuranceAmount,
        bill.grandTotal,
        `"${bill.amountInWords.replace(/"/g, '""')}"`,
        `"${bill.paymentMode}"`,
        `"${(bill.remarks || '').replace(/"/g, '""')}"`
      ];

      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=AmodXpress_Consignments.csv');
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: 'CSV export failed', details: err.message });
  }
};
