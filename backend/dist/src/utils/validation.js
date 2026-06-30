"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billSchema = exports.positiveIntegerSchema = exports.nonNegativeNumberSchema = exports.pincodeSchema = exports.phoneSchema = void 0;
const zod_1 = require("zod");
// Phone schema allows optional/empty, or validates exactly 10 digits if typed
exports.phoneSchema = zod_1.z
    .string()
    .optional()
    .transform((val) => val || '')
    .default('')
    .refine((val) => !val || /^\d{10}$/.test(val), {
    message: 'Mobile number must be exactly 10 digits',
});
// Pincode schema allows optional/empty, or validates exactly 6 digits if typed
exports.pincodeSchema = zod_1.z
    .string()
    .optional()
    .transform((val) => val || '')
    .default('')
    .refine((val) => !val || /^\d{6}$/.test(val), {
    message: 'Pincode must be exactly 6 digits',
});
// Numeric schemas default to 0 if left blank
const nonNegativeNumberSchema = (fieldName) => zod_1.z.union([
    zod_1.z.number(),
    zod_1.z.string().transform((val) => (val === '' || val === undefined ? 0 : parseFloat(val))),
])
    .optional()
    .default(0)
    .refine((val) => !isNaN(val) && val >= 0, {
    message: `${fieldName} cannot be negative`,
});
exports.nonNegativeNumberSchema = nonNegativeNumberSchema;
const positiveIntegerSchema = (fieldName) => zod_1.z.union([
    zod_1.z.number(),
    zod_1.z.string().transform((val) => (val === '' || val === undefined ? 1 : parseInt(val, 10))),
])
    .optional()
    .default(1)
    .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 0, {
    message: `${fieldName} cannot be negative`,
});
exports.positiveIntegerSchema = positiveIntegerSchema;
exports.billSchema = zod_1.z.object({
    bookingType: zod_1.z.enum(['Domestic', 'International']).optional().default('Domestic'),
    bookingMode: zod_1.z.enum(['Air', 'Surface']).optional().default('Air'),
    productType: zod_1.z.enum(['Document', 'Parcel', 'Fragile', 'Others']).optional().default('Document'),
    destination: zod_1.z.string().optional().default(''),
    senderName: zod_1.z.string().optional().default(''),
    senderAddress1: zod_1.z.string().optional().default(''),
    senderAddress2: zod_1.z.string().optional().default(''),
    senderCity: zod_1.z.string().optional().default(''),
    senderState: zod_1.z.string().optional().default(''),
    senderPincode: exports.pincodeSchema,
    senderMobile: exports.phoneSchema,
    receiverName: zod_1.z.string().optional().default(''),
    receiverAddress1: zod_1.z.string().optional().default(''),
    receiverAddress2: zod_1.z.string().optional().default(''),
    receiverCity: zod_1.z.string().optional().default(''),
    receiverState: zod_1.z.string().optional().default(''),
    receiverPincode: exports.pincodeSchema,
    receiverMobile: exports.phoneSchema,
    articles: (0, exports.positiveIntegerSchema)('Number of Articles'),
    actualWeight: (0, exports.nonNegativeNumberSchema)('Actual Weight'),
    length: (0, exports.nonNegativeNumberSchema)('Length'),
    width: (0, exports.nonNegativeNumberSchema)('Width'),
    height: (0, exports.nonNegativeNumberSchema)('Height'),
    volumetricWeight: (0, exports.nonNegativeNumberSchema)('Volumetric Weight'),
    chargeableWeight: (0, exports.nonNegativeNumberSchema)('Chargeable Weight'),
    description: zod_1.z.string().optional().default(''),
    freightCharges: (0, exports.nonNegativeNumberSchema)('Freight Charges'),
    handlingCharges: (0, exports.nonNegativeNumberSchema)('Handling Charges'),
    otherCharges: (0, exports.nonNegativeNumberSchema)('Other Charges'),
    insuranceAmount: (0, exports.nonNegativeNumberSchema)('Insurance Amount'),
    grandTotal: (0, exports.nonNegativeNumberSchema)('Grand Total'),
    amountInWords: zod_1.z.string().optional().default(''),
    paymentMode: zod_1.z.enum(['Cash', 'UPI', 'Card', 'To-Pay', 'COD']).optional().default('Cash'),
    remarks: zod_1.z.string().optional().default(''),
    date: zod_1.z.string().optional(),
    time: zod_1.z.string().optional(),
});
