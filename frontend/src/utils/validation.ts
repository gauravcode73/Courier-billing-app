import { z } from 'zod';

// Phone schema allows optional/empty, or validates exactly 10 digits if typed
export const phoneSchema = z
  .string()
  .optional()
  .transform((val) => val || '')
  .default('')
  .refine((val) => !val || /^\d{10}$/.test(val), {
    message: 'Mobile number must be exactly 10 digits',
  });

// Pincode schema allows optional/empty, or validates exactly 6 digits if typed
export const pincodeSchema = z
  .string()
  .optional()
  .transform((val) => val || '')
  .default('')
  .refine((val) => !val || /^\d{6}$/.test(val), {
    message: 'Pincode must be exactly 6 digits',
  });

// Numeric schemas default to 0 if left blank
export const nonNegativeNumberSchema = (fieldName: string) =>
  z.union([
    z.number(),
    z.string().transform((val) => (val === '' || val === undefined ? 0 : parseFloat(val))),
  ])
  .optional()
  .default(0)
  .refine((val) => !isNaN(val) && val >= 0, {
    message: `${fieldName} cannot be negative`,
  });

export const positiveIntegerSchema = (fieldName: string) =>
  z.union([
    z.number(),
    z.string().transform((val) => (val === '' || val === undefined ? 1 : parseInt(val, 10))),
  ])
  .optional()
  .default(1)
  .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 0, {
    message: `${fieldName} must be a positive integer`,
  });

export const billFormSchema = z.object({
  bookingType: z.enum(['Domestic', 'International']).optional().default('Domestic'),
  bookingMode: z.enum(['Air', 'Surface']).optional().default('Air'),
  productType: z.enum(['Document', 'Parcel', 'Fragile', 'Others']).optional().default('Document'),
  destination: z.string().optional().default(''),
  
  senderName: z.string().optional().default(''),
  senderAddress1: z.string().optional().default(''),
  senderAddress2: z.string().optional().default(''),
  senderCity: z.string().optional().default(''),
  senderState: z.string().optional().default(''),
  senderPincode: pincodeSchema,
  senderMobile: phoneSchema,

  receiverName: z.string().optional().default(''),
  receiverAddress1: z.string().optional().default(''),
  receiverAddress2: z.string().optional().default(''),
  receiverCity: z.string().optional().default(''),
  receiverState: z.string().optional().default(''),
  receiverPincode: pincodeSchema,
  receiverMobile: phoneSchema,

  articles: positiveIntegerSchema('Articles'),
  actualWeight: nonNegativeNumberSchema('Actual Weight'),
  length: nonNegativeNumberSchema('Length'),
  width: nonNegativeNumberSchema('Width'),
  height: nonNegativeNumberSchema('Height'),
  description: z.string().optional().default(''),
  
  freightCharges: nonNegativeNumberSchema('Freight Charges'),
  handlingCharges: nonNegativeNumberSchema('Handling Charges'),
  otherCharges: nonNegativeNumberSchema('Other Charges'),
  insuranceAmount: nonNegativeNumberSchema('Insurance Amount'),

  paymentMode: z.enum(['Cash', 'UPI', 'Card', 'To-Pay', 'COD']).optional().default('Cash'),
  remarks: z.string().optional().default(''),
  
  date: z.string().optional(),
  time: z.string().optional(),
});

export type BillFormInput = z.infer<typeof billFormSchema>;
