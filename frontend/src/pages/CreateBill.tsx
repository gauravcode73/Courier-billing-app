import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../services/api';
import { billFormSchema } from '../utils/validation';
import type { BillFormInput } from '../utils/validation';
import { numberToWords } from '../utils/numberToWords';
import { 
  Package, 
  User, 
  MapPin, 
  Scale, 
  IndianRupee, 
  CreditCard, 
  Printer, 
  Calendar,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Spinner } from '../components/Loader';

export const CreateBill: React.FC = () => {
  const [nextNumbers, setNextNumbers] = useState<{ bookNumber: number; consignmentNumber: number } | null>(null);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getISTDateTimeString = () => {
    const dateObj = new Date();
    const offset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(dateObj.getTime() + offset);

    const year = istDate.getUTCFullYear();
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(istDate.getUTCDate()).padStart(2, '0');
    const hours = String(istDate.getUTCHours()).padStart(2, '0');
    const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');

    return {
      date: `${day}-${month}-${year}`,
      time: `${hours}:${minutes}`,
    };
  };

  const { date: defaultDate, time: defaultTime } = getISTDateTimeString();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BillFormInput>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      bookingType: 'Domestic',
      bookingMode: 'Air',
      productType: 'Document',
      paymentMode: 'Cash',
      articles: 1,
      actualWeight: 0,
      length: 0,
      width: 0,
      height: 0,
      freightCharges: 0,
      handlingCharges: 0,
      otherCharges: 0,
      insuranceAmount: 0,
      senderAddress2: '',
      receiverAddress2: '',
      remarks: '',
      date: defaultDate,
      time: defaultTime,
    },
  });

  // Fetch sequential numbers from backend
  const fetchBookingNumbers = async () => {
    setIsLoadingNumbers(true);
    try {
      const res = await api.get('/bills/numbers');
      setNextNumbers(res.data);
    } catch (err) {
      console.error('Error fetching booking numbers:', err);
      toast.error('Failed to auto-generate book & consignment numbers. Check connection.');
    } finally {
      setIsLoadingNumbers(false);
    }
  };

  useEffect(() => {
    fetchBookingNumbers();
  }, []);

  // Watch fields for automatic computations
  const length = useWatch({ control, name: 'length' }) || 0;
  const width = useWatch({ control, name: 'width' }) || 0;
  const height = useWatch({ control, name: 'height' }) || 0;
  const actualWeight = useWatch({ control, name: 'actualWeight' }) || 0;

  const freightCharges = useWatch({ control, name: 'freightCharges' }) || 0;
  const handlingCharges = useWatch({ control, name: 'handlingCharges' }) || 0;
  const otherCharges = useWatch({ control, name: 'otherCharges' }) || 0;
  const insuranceAmount = useWatch({ control, name: 'insuranceAmount' }) || 0;

  // Real-time automatic calculations
  const volumetricWeight = Math.round(((Number(length) * Number(width) * Number(height)) / 5000) * 100) / 100;
  const chargeableWeight = Math.max(Number(actualWeight), volumetricWeight);
  const grandTotal = Math.round((Number(freightCharges) + Number(handlingCharges) + Number(otherCharges) + Number(insuranceAmount)) * 100) / 100;
  const amountInWords = numberToWords(grandTotal);

  const handleDownloadPdf = async (consignmentNo: number) => {
    try {
      const response = await api.get(`/bills/${consignmentNo}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `AmodXpress_Bill_${consignmentNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`PDF Bill for Consignment #${consignmentNo} downloaded.`);
    } catch (err) {
      console.error('Download PDF error:', err);
      toast.error('Consignment saved, but PDF download failed. Try re-downloading from Search Bills.');
    }
  };

  const onSubmit = async (data: BillFormInput) => {
    if (!nextNumbers) {
      toast.error('Booking numbers not loaded. Please wait or reload.');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving consignment and generating billing details...');
    try {
      // Post booking row
      const response = await api.post('/bills', data);
      const savedRecord = response.data.data;
      
      toast.success(`Consignment #${savedRecord.consignmentNumber} saved successfully.`, { id: toastId });
      
      // Auto-trigger PDF invoice download
      await handleDownloadPdf(savedRecord.consignmentNumber);

      // Reset form variables
      const { date: newDate, time: newTime } = getISTDateTimeString();
      reset({
        bookingType: 'Domestic',
        bookingMode: 'Air',
        productType: 'Document',
        destination: '',
        paymentMode: 'Cash',
        articles: 1,
        actualWeight: 0,
        length: 0,
        width: 0,
        height: 0,
        freightCharges: 0,
        handlingCharges: 0,
        otherCharges: 0,
        insuranceAmount: 0,
        senderName: '',
        senderAddress1: '',
        senderAddress2: '',
        senderCity: '',
        senderState: '',
        senderPincode: '',
        senderMobile: '',
        receiverName: '',
        receiverAddress1: '',
        receiverAddress2: '',
        receiverCity: '',
        receiverState: '',
        receiverPincode: '',
        receiverMobile: '',
        description: '',
        remarks: '',
        date: newDate,
        time: newTime,
      });

      // Refetch next sequence booking numbers
      await fetchBookingNumbers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit consignment booking.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top operational info bar */}
      <div className="flex flex-col sm:flex-row justify-between bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-sm gap-4">
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Consignment Dispatch Registration</h3>
          <p className="text-xs text-slate-400">Fill in booking, address details, freight, weight and payment modes below.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Book / Consignment No</span>
            <div className="text-md font-extrabold text-primary-700">
              {isLoadingNumbers ? (
                <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
              ) : (
                `#${nextNumbers?.consignmentNumber || 1101}`
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Booking Information */}
        <div className="card-standard p-6 border-slate-100 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Package className="text-primary-600" size={20} />
            <h4 className="font-bold text-slate-800 text-sm tracking-tight">Section 1 — Booking Information</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Book Number (Auto)</label>
              <input
                type="text"
                className="form-input bg-slate-50 font-bold text-primary-700"
                value={isLoadingNumbers ? 'Loading...' : `#${nextNumbers?.bookNumber}`}
                disabled
              />
            </div>

            <div>
              <label className="form-label">Consignment Number (Auto)</label>
              <input
                type="text"
                className="form-input bg-slate-50 font-bold text-primary-700"
                value={isLoadingNumbers ? 'Loading...' : `#${nextNumbers?.consignmentNumber}`}
                disabled
              />
            </div>

            <div>
              <label className="form-label">Booking Date</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD-MM-YYYY"
                  className="form-input pl-9"
                  {...register('date')}
                />
                <Calendar size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
              {errors.date && <p className="text-xs text-red-500 mt-1 font-medium">{errors.date.message}</p>}
            </div>

            <div>
              <label className="form-label">Booking Time</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="HH:MM"
                  className="form-input pl-9"
                  {...register('time')}
                />
                <Clock size={15} className="absolute left-3 top-3 text-slate-400" />
              </div>
              {errors.time && <p className="text-xs text-red-500 mt-1 font-medium">{errors.time.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="form-label">Booking Type</label>
              <select className="form-input" {...register('bookingType')}>
                <option value="Domestic">Domestic</option>
                <option value="International">International</option>
              </select>
              {errors.bookingType && <p className="text-xs text-red-500 mt-1 font-medium">{errors.bookingType.message}</p>}
            </div>

            <div>
              <label className="form-label">Booking Mode</label>
              <select className="form-input" {...register('bookingMode')}>
                <option value="Air">Air</option>
                <option value="Surface">Surface</option>
              </select>
              {errors.bookingMode && <p className="text-xs text-red-500 mt-1 font-medium">{errors.bookingMode.message}</p>}
            </div>

            <div>
              <label className="form-label">Product Type</label>
              <select className="form-input" {...register('productType')}>
                <option value="Document">Document</option>
                <option value="Parcel">Parcel / Box</option>
                <option value="Fragile">Fragile</option>
                <option value="Others">Others</option>
              </select>
              {errors.productType && <p className="text-xs text-red-500 mt-1 font-medium">{errors.productType.message}</p>}
            </div>

            <div>
              <label className="form-label">Destination</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Mumbai, New York"
                {...register('destination')}
              />
              {errors.destination && <p className="text-xs text-red-500 mt-1 font-medium">{errors.destination.message}</p>}
            </div>
          </div>
        </div>

        {/* Section 2 & 3: Sender & Receiver Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sender card */}
          <div className="card-standard p-6 border-slate-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="text-primary-600" size={20} />
              <h4 className="font-bold text-slate-800 text-sm tracking-tight">Section 2 — Sender Details</h4>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="form-label">Sender Name</label>
                <input type="text" className="form-input" placeholder="Enter Sender's Full Name" {...register('senderName')} />
                {errors.senderName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.senderName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">Address Line 1</label>
                  <input type="text" className="form-input" placeholder="Flat, House no., Building" {...register('senderAddress1')} />
                  {errors.senderAddress1 && <p className="text-xs text-red-500 mt-1 font-medium">{errors.senderAddress1.message}</p>}
                </div>
                <div>
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input type="text" className="form-input" placeholder="Road, Locality, Area" {...register('senderAddress2')} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" placeholder="City" {...register('senderCity')} />
                  {errors.senderCity && <p className="text-xs text-red-500 mt-1 font-medium">{errors.senderCity.message}</p>}
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" placeholder="State" {...register('senderState')} />
                  {errors.senderState && <p className="text-xs text-red-500 mt-1 font-medium">{errors.senderState.message}</p>}
                </div>
                <div>
                  <label className="form-label">Pincode (6 Digits)</label>
                  <input type="text" className="form-input" placeholder="110006" {...register('senderPincode')} />
                  {errors.senderPincode && <p className="text-xs text-red-500 mt-1 font-medium">{errors.senderPincode.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">Mobile Number (10 Digits)</label>
                <input type="text" className="form-input font-mono" placeholder="9876543210" {...register('senderMobile')} />
                {errors.senderMobile && <p className="text-xs text-red-500 mt-1 font-medium">{errors.senderMobile.message}</p>}
              </div>
            </div>
          </div>

          {/* Receiver card */}
          <div className="card-standard p-6 border-slate-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="text-primary-600" size={20} />
              <h4 className="font-bold text-slate-800 text-sm tracking-tight">Section 3 — Receiver Details</h4>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="form-label">Receiver Name</label>
                <input type="text" className="form-input" placeholder="Enter Receiver's Full Name" {...register('receiverName')} />
                {errors.receiverName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.receiverName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">Address Line 1</label>
                  <input type="text" className="form-input" placeholder="Flat, House no., Building" {...register('receiverAddress1')} />
                  {errors.receiverAddress1 && <p className="text-xs text-red-500 mt-1 font-medium">{errors.receiverAddress1.message}</p>}
                </div>
                <div>
                  <label className="form-label">Address Line 2 (Optional)</label>
                  <input type="text" className="form-input" placeholder="Road, Locality, Area" {...register('receiverAddress2')} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="form-label">City</label>
                  <input type="text" className="form-input" placeholder="City" {...register('receiverCity')} />
                  {errors.receiverCity && <p className="text-xs text-red-500 mt-1 font-medium">{errors.receiverCity.message}</p>}
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input type="text" className="form-input" placeholder="State" {...register('receiverState')} />
                  {errors.receiverState && <p className="text-xs text-red-500 mt-1 font-medium">{errors.receiverState.message}</p>}
                </div>
                <div>
                  <label className="form-label">Pincode (6 Digits)</label>
                  <input type="text" className="form-input" placeholder="400001" {...register('receiverPincode')} />
                  {errors.receiverPincode && <p className="text-xs text-red-500 mt-1 font-medium">{errors.receiverPincode.message}</p>}
                </div>
              </div>

              <div>
                <label className="form-label">Mobile Number (10 Digits)</label>
                <input type="text" className="form-input font-mono" placeholder="9876543210" {...register('receiverMobile')} />
                {errors.receiverMobile && <p className="text-xs text-red-500 mt-1 font-medium">{errors.receiverMobile.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Shipment Details */}
        <div className="card-standard p-6 border-slate-100 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Scale className="text-primary-600" size={20} />
            <h4 className="font-bold text-slate-800 text-sm tracking-tight">Section 4 — Shipment Details</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="form-label">No. of Articles</label>
              <input type="number" min="1" className="form-input font-semibold" {...register('articles')} />
              {errors.articles && <p className="text-xs text-red-500 mt-1 font-medium">{errors.articles.message}</p>}
            </div>

            <div>
              <label className="form-label">Actual Weight (kg)</label>
              <input type="number" step="0.01" min="0" className="form-input font-semibold" {...register('actualWeight')} />
              {errors.actualWeight && <p className="text-xs text-red-500 mt-1 font-medium">{errors.actualWeight.message}</p>}
            </div>

            <div>
              <label className="form-label">Length (cm)</label>
              <input type="number" step="0.1" min="0" className="form-input" placeholder="0" {...register('length')} />
              {errors.length && <p className="text-xs text-red-500 mt-1 font-medium">{errors.length.message}</p>}
            </div>

            <div>
              <label className="form-label">Width (cm)</label>
              <input type="number" step="0.1" min="0" className="form-input" placeholder="0" {...register('width')} />
              {errors.width && <p className="text-xs text-red-500 mt-1 font-medium">{errors.width.message}</p>}
            </div>

            <div>
              <label className="form-label">Height (cm)</label>
              <input type="number" step="0.1" min="0" className="form-input" placeholder="0" {...register('height')} />
              {errors.height && <p className="text-xs text-red-500 mt-1 font-medium">{errors.height.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200/60 rounded-xl p-4">
            <div className="flex justify-between items-center bg-white p-3 border border-slate-100 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Calculated Volumetric Weight</span>
                <span className="text-xs text-slate-500 font-medium">(L x W x H ÷ 5000)</span>
              </div>
              <div className="text-md font-bold text-slate-700">{volumetricWeight} kg</div>
            </div>

            <div className="flex justify-between items-center bg-primary-50/50 p-3 border border-primary-100 rounded-lg">
              <div>
                <span className="text-[10px] text-primary-500 font-semibold uppercase tracking-wider block">Chargeable Weight (Max)</span>
                <span className="text-xs text-primary-400 font-medium">Actual vs Volumetric</span>
              </div>
              <div className="text-md font-extrabold text-primary-700">{chargeableWeight} kg</div>
            </div>
          </div>

          <div>
            <label className="form-label">Description of Goods</label>
            <input type="text" className="form-input" placeholder="e.g. Documents, Electronic Parts, Clothing" {...register('description')} />
            {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description.message}</p>}
          </div>
        </div>

        {/* Section 5: Charges */}
        <div className="card-standard p-6 border-slate-100 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <IndianRupee className="text-primary-600" size={20} />
            <h4 className="font-bold text-slate-800 text-sm tracking-tight">Section 5 — Charges</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Freight Charges (₹)</label>
              <input type="number" step="0.01" min="0" className="form-input font-semibold" {...register('freightCharges')} />
              {errors.freightCharges && <p className="text-xs text-red-500 mt-1 font-medium">{errors.freightCharges.message}</p>}
            </div>

            <div>
              <label className="form-label">Handling Charges (₹)</label>
              <input type="number" step="0.01" min="0" className="form-input font-semibold" {...register('handlingCharges')} />
              {errors.handlingCharges && <p className="text-xs text-red-500 mt-1 font-medium">{errors.handlingCharges.message}</p>}
            </div>

            <div>
              <label className="form-label">Other Charges (₹)</label>
              <input type="number" step="0.01" min="0" className="form-input font-semibold" {...register('otherCharges')} />
              {errors.otherCharges && <p className="text-xs text-red-500 mt-1 font-medium">{errors.otherCharges.message}</p>}
            </div>

            <div>
              <label className="form-label">Insurance Amount (₹)</label>
              <input type="number" step="0.01" min="0" className="form-input font-semibold" {...register('insuranceAmount')} />
              {errors.insuranceAmount && <p className="text-xs text-red-500 mt-1 font-medium">{errors.insuranceAmount.message}</p>}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center bg-white p-4 border border-slate-100 rounded-lg">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Grand Total</span>
                <span className="text-xs text-slate-400 font-medium">Excludes GST (Zero Tax Policy)</span>
              </div>
              <div className="text-xl font-black text-slate-800">₹{grandTotal.toFixed(2)}</div>
            </div>

            <div className="text-xs text-slate-500 bg-white border border-slate-100 rounded-lg p-3">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[9px] mb-1">Amount in Words</span>
              <span className="font-bold text-slate-700 capitalize">{amountInWords}</span>
            </div>
          </div>
        </div>

        {/* Section 6 & 7: Payment & Remarks */}
        <div className="card-standard p-6 border-slate-100 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="text-primary-600" size={20} />
            <h4 className="font-bold text-slate-800 text-sm tracking-tight">Section 6 & 7 — Payment & Remarks</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Payment Mode</label>
              <select className="form-input" {...register('paymentMode')}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="To-Pay">To-Pay / COD</option>
              </select>
              {errors.paymentMode && <p className="text-xs text-red-500 mt-1 font-medium">{errors.paymentMode.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Remarks (Optional)</label>
              <textarea rows={1} className="form-input" placeholder="Enter special delivery instructions or remarks" {...register('remarks')} />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              reset();
              fetchBookingNumbers();
            }}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2 px-6"
            disabled={isSubmitting || isLoadingNumbers}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className="border-white" />
                <span>Processing Bill...</span>
              </>
            ) : (
              <>
                <Printer size={16} />
                <span>Generate Bill & Print</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
