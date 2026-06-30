"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleSheetsService = exports.SHEET_COLUMNS = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const googleapis_1 = require("googleapis");
// The columns matching the Google Sheets structure
exports.SHEET_COLUMNS = [
    'Book Number',
    'Consignment Number',
    'Date',
    'Time',
    'Booking Type',
    'Booking Mode',
    'Product Type',
    'Destination',
    'Sender Name',
    'Sender Address',
    'Sender City',
    'Sender State',
    'Sender Pincode',
    'Sender Mobile',
    'Receiver Name',
    'Receiver Address',
    'Receiver City',
    'Receiver State',
    'Receiver Pincode',
    'Receiver Mobile',
    'Articles',
    'Actual Weight',
    'Length',
    'Width',
    'Height',
    'Volumetric Weight',
    'Chargeable Weight',
    'Description',
    'Freight Charges',
    'Handling Charges',
    'Other Charges',
    'Insurance Amount',
    'Grand Total',
    'Amount in Words',
    'Payment Mode',
    'Remarks',
    'Created At',
    'Updated At'
];
class GoogleSheetsService {
    sheets = null;
    spreadsheetId = '';
    isFallbackMode = false;
    localDbPath = '';
    constructor() {
        this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID || '';
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
        const privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
        this.localDbPath = path.join(__dirname, '../../local_database.json');
        if (!this.spreadsheetId || !clientEmail || !privateKey) {
            console.warn('⚠️ Google Sheets configuration missing or incomplete. Operating in LOCAL FALLBACK mode.');
            this.isFallbackMode = true;
            this.initLocalDb();
        }
        else {
            try {
                const formattedKey = privateKey.replace(/\\n/g, '\n');
                const auth = new googleapis_1.google.auth.JWT(clientEmail, undefined, formattedKey, ['https://www.googleapis.com/auth/spreadsheets']);
                this.sheets = googleapis_1.google.sheets({ version: 'v4', auth });
                console.log('✅ Google Sheets service initialized.');
            }
            catch (err) {
                console.error('❌ Failed to initialize Google Sheets client:', err);
                console.warn('Switching to LOCAL FALLBACK mode.');
                this.isFallbackMode = true;
                this.initLocalDb();
            }
        }
    }
    initLocalDb() {
        if (!fs.existsSync(this.localDbPath)) {
            fs.writeFileSync(this.localDbPath, JSON.stringify([], null, 2));
        }
    }
    getLocalData() {
        this.initLocalDb();
        const data = fs.readFileSync(this.localDbPath, 'utf-8');
        return JSON.parse(data);
    }
    saveLocalData(data) {
        fs.writeFileSync(this.localDbPath, JSON.stringify(data, null, 2));
    }
    // Ensure sheet and headers are initialized
    async initSheetIfNeeded() {
        if (this.isFallbackMode)
            return;
        try {
            // Check sheet metadata
            const res = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            const sheetName = res.data.sheets?.[0]?.properties?.title || 'Sheet1';
            // Check if headers exist
            const readRes = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A1:Z1`,
            });
            const values = readRes.data.values;
            if (!values || values.length === 0 || values[0].length === 0) {
                // Write headers
                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: `${sheetName}!A1`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [exports.SHEET_COLUMNS],
                    },
                });
                console.log('✅ Created headers in Google Sheet:', sheetName);
            }
        }
        catch (err) {
            console.error('❌ Error initializing sheet headers:', err);
            throw err;
        }
    }
    recordToRow(record) {
        return [
            record.bookNumber,
            record.consignmentNumber,
            record.date,
            record.time,
            record.bookingType,
            record.bookingMode,
            record.productType,
            record.destination || '',
            record.senderName,
            record.senderAddress,
            record.senderCity,
            record.senderState,
            record.senderPincode,
            record.senderMobile,
            record.receiverName,
            record.receiverAddress,
            record.receiverCity,
            record.receiverState,
            record.receiverPincode,
            record.receiverMobile,
            record.articles,
            record.actualWeight,
            record.length,
            record.width,
            record.height,
            record.volumetricWeight,
            record.chargeableWeight,
            record.description,
            record.freightCharges,
            record.handlingCharges,
            record.otherCharges,
            record.insuranceAmount,
            record.grandTotal,
            record.amountInWords,
            record.paymentMode,
            record.remarks || '',
            record.createdAt,
            record.updatedAt
        ];
    }
    rowToRecord(row) {
        return {
            bookNumber: parseInt(row[0], 10),
            consignmentNumber: parseInt(row[1], 10),
            date: row[2],
            time: row[3],
            bookingType: row[4],
            bookingMode: row[5],
            productType: row[6],
            destination: row[7] || '',
            senderName: row[8],
            senderAddress: row[9],
            senderCity: row[10],
            senderState: row[11],
            senderPincode: row[12],
            senderMobile: row[13],
            receiverName: row[14],
            receiverAddress: row[15],
            receiverCity: row[16],
            receiverState: row[17],
            receiverPincode: row[18],
            receiverMobile: row[19],
            articles: parseInt(row[20], 10) || 0,
            actualWeight: parseFloat(row[21]) || 0,
            length: parseFloat(row[22]) || 0,
            width: parseFloat(row[23]) || 0,
            height: parseFloat(row[24]) || 0,
            volumetricWeight: parseFloat(row[25]) || 0,
            chargeableWeight: parseFloat(row[26]) || 0,
            description: row[27] || '',
            freightCharges: parseFloat(row[28]) || 0,
            handlingCharges: parseFloat(row[29]) || 0,
            otherCharges: parseFloat(row[30]) || 0,
            insuranceAmount: parseFloat(row[31]) || 0,
            grandTotal: parseFloat(row[32]) || 0,
            amountInWords: row[33] || '',
            paymentMode: row[34],
            remarks: row[35] || '',
            createdAt: row[36] || '',
            updatedAt: row[37] || '',
        };
    }
    async getLatestNumbers() {
        if (this.isFallbackMode) {
            const records = this.getLocalData();
            if (records.length === 0) {
                return { bookNumber: 1101, consignmentNumber: 1101 };
            }
            const maxBookNum = Math.max(...records.map(r => r.bookNumber));
            const nextNum = maxBookNum + 1;
            return { bookNumber: nextNum, consignmentNumber: nextNum };
        }
        try {
            await this.initSheetIfNeeded();
            const res = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            const sheetName = res.data.sheets?.[0]?.properties?.title || 'Sheet1';
            // Read Book Numbers
            const readRes = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A2:B`,
            });
            const values = readRes.data.values;
            if (!values || values.length === 0) {
                return { bookNumber: 1101, consignmentNumber: 1101 };
            }
            let maxBookNum = 1100;
            for (const row of values) {
                const num = parseInt(row[0], 10);
                if (!isNaN(num) && num > maxBookNum) {
                    maxBookNum = num;
                }
            }
            const nextNum = maxBookNum + 1;
            return { bookNumber: nextNum, consignmentNumber: nextNum };
        }
        catch (err) {
            console.error('❌ Error getting latest book numbers from Sheets:', err);
            // Fail-safe default
            return { bookNumber: 1101, consignmentNumber: 1101 };
        }
    }
    async appendBill(record) {
        if (this.isFallbackMode) {
            const records = this.getLocalData();
            // Ensure no duplicates
            if (records.some(r => r.consignmentNumber === record.consignmentNumber)) {
                throw new Error(`Consignment number ${record.consignmentNumber} already exists`);
            }
            records.push(record);
            this.saveLocalData(records);
            return;
        }
        try {
            await this.initSheetIfNeeded();
            const res = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            const sheetName = res.data.sheets?.[0]?.properties?.title || 'Sheet1';
            // Verify no duplicates
            const allRecords = await this.getAllBills();
            if (allRecords.some(r => r.consignmentNumber === record.consignmentNumber)) {
                throw new Error(`Consignment number ${record.consignmentNumber} already exists in Sheet`);
            }
            const rowValues = this.recordToRow(record);
            await this.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A2`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [rowValues],
                },
            });
        }
        catch (err) {
            console.error('❌ Error appending bill row to Google Sheet:', err);
            throw new Error('Google Sheet insertion failed: ' + err.message);
        }
    }
    async updateBill(consignmentNumber, record) {
        if (this.isFallbackMode) {
            const records = this.getLocalData();
            const idx = records.findIndex(r => r.consignmentNumber === consignmentNumber);
            if (idx === -1)
                throw new Error(`Consignment ${consignmentNumber} not found`);
            records[idx] = { ...records[idx], ...record, updatedAt: new Date().toISOString() };
            this.saveLocalData(records);
            return;
        }
        try {
            await this.initSheetIfNeeded();
            const res = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            const sheetName = res.data.sheets?.[0]?.properties?.title || 'Sheet1';
            // Find the row index
            const readRes = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A2:B`,
            });
            const values = readRes.data.values || [];
            let rowIndex = -1;
            for (let i = 0; i < values.length; i++) {
                if (parseInt(values[i][1], 10) === consignmentNumber) {
                    rowIndex = i + 2; // +2 because sheet is 1-based and index 0 is row A2
                    break;
                }
            }
            if (rowIndex === -1) {
                throw new Error(`Consignment ${consignmentNumber} not found in Google Sheets`);
            }
            // Read existing record to merge update
            const existingRes = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A${rowIndex}:AK${rowIndex}`,
            });
            const existingRow = existingRes.data.values?.[0] || [];
            const existingRecord = this.rowToRecord(existingRow);
            const updatedRecord = {
                ...existingRecord,
                ...record,
                updatedAt: new Date().toISOString(),
            };
            const rowValues = this.recordToRow(updatedRecord);
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A${rowIndex}`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [rowValues],
                },
            });
        }
        catch (err) {
            console.error(`❌ Error updating consignment ${consignmentNumber} in Google Sheet:`, err);
            throw new Error('Google Sheet update failed: ' + err.message);
        }
    }
    async deleteBill(consignmentNumber) {
        if (this.isFallbackMode) {
            const records = this.getLocalData();
            const filtered = records.filter(r => r.consignmentNumber !== consignmentNumber);
            if (records.length === filtered.length) {
                throw new Error(`Consignment ${consignmentNumber} not found`);
            }
            this.saveLocalData(filtered);
            return;
        }
        try {
            await this.initSheetIfNeeded();
            const res = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            const sheetsList = res.data.sheets || [];
            const firstSheet = sheetsList[0];
            const sheetName = firstSheet?.properties?.title || 'Sheet1';
            const sheetId = firstSheet?.properties?.sheetId || 0;
            // Find the row index
            const readRes = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!B2:B`,
            });
            const values = readRes.data.values || [];
            let rowIndex = -1;
            for (let i = 0; i < values.length; i++) {
                if (parseInt(values[i][0], 10) === consignmentNumber) {
                    rowIndex = i + 1; // Row index inside sheet (excluding headers) is i+1. (e.g. if i=0, it's the second row of the sheet, index 1)
                    break;
                }
            }
            if (rowIndex === -1) {
                throw new Error(`Consignment ${consignmentNumber} not found in Google Sheets`);
            }
            // Delete row using batchUpdate
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                requestBody: {
                    requests: [
                        {
                            deleteDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: 'ROWS',
                                    startIndex: rowIndex, // 0-based index. Row index 1 = Row 2 of the sheet.
                                    endIndex: rowIndex + 1,
                                },
                            },
                        },
                    ],
                },
            });
        }
        catch (err) {
            console.error(`❌ Error deleting consignment ${consignmentNumber} from Google Sheet:`, err);
            throw new Error('Google Sheet deletion failed: ' + err.message);
        }
    }
    async getAllBills() {
        if (this.isFallbackMode) {
            return this.getLocalData();
        }
        try {
            await this.initSheetIfNeeded();
            const res = await this.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId,
            });
            const sheetName = res.data.sheets?.[0]?.properties?.title || 'Sheet1';
            const readRes = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${sheetName}!A2:AK`,
            });
            const values = readRes.data.values;
            if (!values || values.length === 0) {
                return [];
            }
            return values
                .filter((row) => row.length > 1 && row[1]) // Ensure row has Consignment Number
                .map((row) => this.rowToRecord(row));
        }
        catch (err) {
            console.error('❌ Error getting all bills from Google Sheet:', err);
            return [];
        }
    }
}
exports.GoogleSheetsService = GoogleSheetsService;
